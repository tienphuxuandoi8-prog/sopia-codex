const prisma = require('../../lib/prisma');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Lấy tất cả tiến độ đọc của người dùng
 * @param {string} userId - ID của người dùng
 */
async function getAllProgress(userId) {
  return prisma.readingProgress.findMany({
    where: { userId },
    include: {
      book: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          author: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

/**
 * Lấy tiến độ đọc của một sách
 * @param {string} userId - ID của người dùng
 * @param {string} bookId - ID của sách
 */
async function getBookProgress(userId, bookId) {
  return prisma.readingProgress.findUnique({
    where: {
      userId_bookId: { userId, bookId }
    }
  });
}

/**
 * Cập nhật hoặc tạo mới tiến độ đọc
 * @param {string} userId - ID của người dùng
 * @param {string} bookId - ID của sách
 * @param {object} data - Dữ liệu tiến độ (chapterId, paragraphIndex, progressPct)
 */
async function saveProgress(userId, bookId, data) {
  return prisma.readingProgress.upsert({
    where: {
      userId_bookId: { userId, bookId }
    },
    update: {
      chapterId: data.chapterId,
      paragraphIndex: data.paragraphIndex,
      progressPct: data.progressPct,
      updatedAt: new Date()
    },
    create: {
      userId,
      bookId,
      chapterId: data.chapterId,
      paragraphIndex: data.paragraphIndex,
      progressPct: data.progressPct
    }
  });
}

/**
 * Lấy danh sách sách trên kệ
 * @param {string} userId - ID của người dùng
 * @param {string} [shelf] - Tên kệ (WANT, READING, FINISHED)
 */
async function getBookshelf(userId, shelf) {
  const where = { userId };
  if (shelf) where.shelf = shelf;

  return prisma.bookshelfItem.findMany({
    where,
    include: {
      book: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          author: true
        }
      }
    },
    orderBy: { addedAt: 'desc' }
  });
}

/**
 * Cập nhật thông tin sách trên kệ
 * @param {string} userId - ID của người dùng
 * @param {string} bookId - ID của sách
 * @param {object} data - Dữ liệu (shelf, isFavorite)
 */
async function updateBookshelfItem(userId, bookId, data) {
  return prisma.bookshelfItem.upsert({
    where: {
      userId_bookId: { userId, bookId }
    },
    update: {
      shelf: data.shelf,
      isFavorite: data.isFavorite
    },
    create: {
      userId,
      bookId,
      shelf: data.shelf,
      isFavorite: data.isFavorite !== undefined ? data.isFavorite : false
    }
  });
}

/**
 * Xóa sách khỏi kệ
 * @param {string} userId - ID của người dùng
 * @param {string} bookId - ID của sách
 */
async function removeBookshelfItem(userId, bookId) {
  return prisma.bookshelfItem.delete({
    where: {
      userId_bookId: { userId, bookId }
    }
  });
}

/**
 * Lấy danh sách đánh dấu (highlight)
 * @param {string} userId - ID của người dùng
 * @param {object} filters - Bộ lọc (chapterId, bookId)
 */
async function getHighlights(userId, { chapterId, bookId }) {
  const where = { userId };
  if (chapterId) {
    where.chapterId = chapterId;
  } else if (bookId) {
    where.chapter = { bookId };
  }

  return prisma.highlight.findMany({
    where,
    include: {
      chapter: {
        select: {
          id: true,
          title: true,
          bookId: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Tạo đánh dấu mới
 * @param {string} userId - ID của người dùng
 * @param {object} data - Dữ liệu highlight
 */
async function createHighlight(userId, data) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: data.chapterId }
  });

  if (!chapter) {
    throw new AppError(404, 'Chapter not found');
  }

  // Kiểm tra quyền truy cập chapter premium (nếu cần thiết) ở đây

  return prisma.highlight.create({
    data: {
      userId,
      chapterId: data.chapterId,
      paragraphIndex: data.paragraphIndex,
      startOffset: data.startOffset,
      endOffset: data.endOffset,
      quoteText: data.quoteText,
      color: data.color || 'gold',
      note: data.note
    }
  });
}

/**
 * Cập nhật đánh dấu
 * @param {string} userId - ID của người dùng
 * @param {string} id - ID của highlight
 * @param {object} data - Dữ liệu cập nhật
 */
async function updateHighlight(userId, id, data) {
  const highlight = await prisma.highlight.findUnique({
    where: { id }
  });

  if (!highlight) {
    throw new AppError(404, 'Highlight not found');
  }

  if (highlight.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  return prisma.highlight.update({
    where: { id },
    data: {
      color: data.color,
      note: data.note
    }
  });
}

/**
 * Xóa đánh dấu
 * @param {string} userId - ID của người dùng
 * @param {string} id - ID của highlight
 */
async function deleteHighlight(userId, id) {
  const highlight = await prisma.highlight.findUnique({
    where: { id }
  });

  if (!highlight) {
    throw new AppError(404, 'Highlight not found');
  }

  if (highlight.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  return prisma.highlight.delete({
    where: { id }
  });
}

/**
 * Ghi nhận phiên đọc, cập nhật thời gian và chuỗi ngày đọc
 * @param {string} userId - ID của người dùng
 * @param {object} data - Dữ liệu phiên đọc
 */
async function recordReadingSession(userId, data) {
  // Tạo phiên đọc
  const session = await prisma.readingSession.create({
    data: {
      userId,
      bookId: data.bookId,
      chapterId: data.chapterId,
      durationSeconds: data.durationSeconds,
      scrollDepth: data.scrollDepth,
      device: data.device
    }
  });

  // Lấy ngày hiện tại theo múi giờ Việt Nam
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
  const todayStr = formatter.format(now);
  const todayDate = new Date(todayStr); // YYYY-MM-DD

  // Cập nhật thời gian đọc trong ngày
  const readingDay = await prisma.readingDay.upsert({
    where: {
      userId_date: { userId, date: todayDate }
    },
    update: {
      secondsRead: { increment: data.durationSeconds }
    },
    create: {
      userId,
      date: todayDate,
      secondsRead: data.durationSeconds
    }
  });

  // Kiểm tra cập nhật chuỗi (streak) và kinh nghiệm (xp)
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (readingDay.secondsRead >= 120) {
    let userLastReadStr = '';
    if (user.lastReadDate) {
      userLastReadStr = user.lastReadDate.toISOString().split('T')[0];
    }
    
    const todayISOStr = todayDate.toISOString().split('T')[0];

    // Chỉ cập nhật nếu hôm nay chưa cập nhật streak
    if (userLastReadStr !== todayISOStr) {
      let currentStreak = 1;

      if (user.lastReadDate) {
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (userLastReadStr === yesterdayStr) {
          currentStreak = (user.currentStreak || 0) + 1;
        }
      }

      const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

      await prisma.user.update({
        where: { id: userId },
        data: {
          lastReadDate: todayDate,
          currentStreak,
          longestStreak,
          xp: { increment: 10 }
        }
      });
    }
  }

  return { session, readingDay };
}

module.exports = {
  getAllProgress,
  getBookProgress,
  saveProgress,
  getBookshelf,
  updateBookshelfItem,
  removeBookshelfItem,
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  recordReadingSession
};
