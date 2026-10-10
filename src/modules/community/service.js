const prisma = require('../../lib/prisma');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Loại bỏ dấu tiếng Việt để kiểm tra từ khóa
 * @param {string} str Chuỗi cần chuẩn hóa
 * @returns {string} Chuỗi không dấu, chữ thường
 */
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Lấy danh sách đánh giá của sách
 */
async function getBookReviews(bookId, { page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { bookId, status: 'VISIBLE' },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { bookId, status: 'VISIBLE' } })
  ]);
  
  return { reviews, total, page, limit };
}

/**
 * Thêm hoặc cập nhật đánh giá
 */
async function upsertReview(userId, bookId, { rating, content }) {
  // Kiểm tra quyền bình luận
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.status === 'MUTED') {
    throw new AppError(403, 'USER_MUTED', 'Tài khoản của bạn đã bị cấm bình luận/đánh giá');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Upsert đánh giá
    const review = await tx.review.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: { rating, content },
      create: { userId, bookId, rating, content },
    });

    // 2. Tính toán lại avg và count
    const agg = await tx.review.aggregate({
      where: { bookId, status: 'VISIBLE' },
      _avg: { rating: true },
      _count: { id: true },
    });

    const ratingAvg = agg._avg.rating || 0;
    const ratingCount = agg._count.id || 0;

    // 3. Cập nhật bảng book
    await tx.book.update({
      where: { id: bookId },
      data: { ratingAvg, ratingCount },
    });

    return review;
  });
}

/**
 * Xóa đánh giá
 */
async function deleteReview(userId, reviewId, isAdmin = false) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đánh giá');
  
  if (!isAdmin && review.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Không có quyền xóa đánh giá này');
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    
    // Tính lại rating
    const agg = await tx.review.aggregate({
      where: { bookId: review.bookId, status: 'VISIBLE' },
      _avg: { rating: true },
      _count: { id: true },
    });

    const ratingAvg = agg._avg.rating || 0;
    const ratingCount = agg._count.id || 0;

    await tx.book.update({
      where: { id: review.bookId },
      data: { ratingAvg, ratingCount },
    });
  });

  return { success: true };
}

/**
 * Kiểm tra từ khóa cấm
 */
async function checkBannedWords(text) {
  const bannedWords = await prisma.bannedWord.findMany();
  const normalizedText = removeDiacritics(text);
  
  for (const bw of bannedWords) {
    const normalizedBw = removeDiacritics(bw.word);
    if (normalizedText.includes(normalizedBw)) {
      throw new AppError(400, 'BANNED_WORDS_DETECTED', 'Bình luận chứa từ ngữ không phù hợp với chuẩn mực tri thức');
    }
  }
}

/**
 * Lấy danh sách bình luận
 */
async function getComments({ bookId, chapterId, page = 1, limit = 50 }) {
  const where = {
    bookId,
    ...(chapterId ? { chapterId } : {}),
    status: 'VISIBLE',
  };
  
  const comments = await prisma.comment.findMany({
    where,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true, level: true } }
    }
  });

  // Chia comments thành root và replies
  const roots = [];
  const repliesMap = new Map();

  for (const c of comments) {
    if (!c.parentId) {
      roots.push({ ...c, replies: [] });
    } else {
      if (!repliesMap.has(c.parentId)) {
        repliesMap.set(c.parentId, []);
      }
      repliesMap.get(c.parentId).push(c);
    }
  }

  for (const root of roots) {
    root.replies = repliesMap.get(root.id) || [];
  }

  return roots;
}

/**
 * Tạo bình luận
 */
async function createComment(userId, { bookId, chapterId, parentId, content }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.status === 'MUTED') {
    throw new AppError(403, 'USER_MUTED', 'Tài khoản của bạn đã bị cấm bình luận/đánh giá');
  }

  await checkBannedWords(content);

  const comment = await prisma.comment.create({
    data: { userId, bookId, chapterId, parentId, content },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true, level: true } }
    }
  });

  return comment;
}

/**
 * Cập nhật bình luận
 */
async function updateComment(userId, commentId, { content }) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy bình luận');
  if (comment.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Không có quyền chỉnh sửa bình luận này');
  
  const now = new Date();
  const diffMinutes = (now.getTime() - comment.createdAt.getTime()) / (1000 * 60);
  if (diffMinutes > 15) {
    throw new AppError(400, 'EDIT_EXPIRED', 'Chỉ có thể chỉnh sửa bình luận trong vòng 15 phút sau khi đăng');
  }

  await checkBannedWords(content);

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content, editedAt: now }
  });

  return updated;
}

/**
 * Xóa bình luận (đánh dấu DELETED)
 */
async function deleteComment(userId, commentId, isAdmin = false) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy bình luận');
  
  if (!isAdmin && comment.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Không có quyền xóa bình luận này');
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: 'DELETED' }
  });

  return { success: true };
}

/**
 * Báo cáo bình luận
 */
async function reportComment(userId, commentId, reason) {
  await prisma.$transaction(async (tx) => {
    // Lưu report
    await tx.commentReport.upsert({
      where: { commentId_reporterId: { commentId, reporterId: userId } },
      update: { reason },
      create: { commentId, reporterId: userId, reason }
    });

    // Tính tổng report
    const count = await tx.commentReport.count({ where: { commentId } });
    
    // Cập nhật count vào comment
    const updateData = { reportCount: count };
    // Ẩn tự động nếu đạt 3 report
    if (count >= 3) {
      updateData.status = 'HIDDEN';
    }

    await tx.comment.update({
      where: { id: commentId },
      data: updateData
    });
  });

  return { success: true };
}

/**
 * Moderation Services (Admin)
 */

async function getAdminComments({ status, reportedOnly, page = 1, limit = 30 }) {
  const where = {};
  if (status) where.status = status;
  if (reportedOnly) where.reportCount = { gt: 0 };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { displayName: true } }
      }
    }),
    prisma.comment.count({ where })
  ]);

  return { comments, total, page, limit };
}

async function setCommentStatus(commentId, status) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: { status }
  });
}

async function getBannedWords() {
  return await prisma.bannedWord.findMany({
    orderBy: { word: 'asc' }
  });
}

async function addBannedWord(word, createdBy) {
  return await prisma.bannedWord.create({
    data: { word, createdBy }
  });
}

async function deleteBannedWord(id) {
  await prisma.bannedWord.delete({ where: { id } });
  return { success: true };
}

module.exports = {
  getBookReviews, upsertReview, deleteReview,
  getComments, createComment, updateComment, deleteComment, reportComment,
  getAdminComments, setCommentStatus,
  getBannedWords, addBannedWord, deleteBannedWord
};
