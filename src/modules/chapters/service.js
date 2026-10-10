const prisma = require('../../lib/prisma.js');
const { AppError } = require('../../middleware/errorHandler.js');

/**
 * Lấy danh sách chương của một sách
 */
const getChaptersByBook = async (bookId) => {
  try {
    // Đầu tiên thử tìm sách để xem bookId truyền vào là id hay slug
    const book = await prisma.book.findFirst({
      where: {
        OR: [
          { id: bookId },
          { slug: bookId }
        ]
      },
      select: { id: true }
    });

    if (!book) {
      throw new AppError('Không tìm thấy sách', 404);
    }

    const chapters = await prisma.chapter.findMany({
      where: {
        bookId: book.id,
        status: 'PUBLISHED' // Chỉ lấy chương đã xuất bản cho public
      },
      select: {
        id: true,
        title: true,
        chapterIndex: true,
        chapterNumber: true,
        readingTimeMinutes: true,
        accessLevel: true,
        status: true,
        slug: true
      },
      orderBy: {
        chapterIndex: 'asc'
      }
    });

    return chapters;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Lỗi khi lấy danh sách chương: ${error.message}`, 500);
  }
};

/**
 * Lấy chi tiết một chương, có xử lý quyền truy cập nội dung
 */
const getChapterById = async (id, user = null) => {
  try {
    const chapter = await prisma.chapter.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            previewParagraphs: true
          }
        }
      }
    });

    if (!chapter) {
      throw new AppError('Không tìm thấy chương', 404);
    }

    if (chapter.status !== 'PUBLISHED' && (!user || user.role === 'USER')) {
      throw new AppError('Chương này chưa được xuất bản', 403);
    }

    // Kiểm tra quyền truy cập nếu là nội dung PREMIUM
    if (chapter.accessLevel === 'PREMIUM') {
      let hasAccess = false;

      if (user) {
        // Kiểm tra quyền 'book.view_all'
        const hasViewAllPerm = user.role === 'ADMIN' || (user.permissions && user.permissions.includes('book.view_all'));
        
        // Kiểm tra subscription còn hạn
        const hasActiveSub = user.subscription && user.subscription.expiresAt && new Date(user.subscription.expiresAt) > new Date();

        if (hasViewAllPerm || hasActiveSub) {
          hasAccess = true;
        }
      }

      // Nếu không có quyền, cắt bớt nội dung
      if (!hasAccess) {
        const previewLimit = chapter.book.previewParagraphs || 3;
        
        // Cắt bớt paragraphs nếu content là mảng
        if (Array.isArray(chapter.content)) {
          chapter.content = chapter.content.slice(0, previewLimit);
        } else if (typeof chapter.content === 'string') {
          // Xử lý fallback nếu content vô tình bị lưu dạng string (do lỗi parse)
          try {
            const parsed = JSON.parse(chapter.content);
            if (Array.isArray(parsed)) {
              chapter.content = parsed.slice(0, previewLimit);
            }
          } catch (e) {
            // Do nothing, can't reliably slice a string
          }
        }
        
        chapter.locked = true; // Đánh dấu để client biết là nội dung bị khóa
        chapter.takeaways = []; // Ẩn takeaways đối với user không có quyền
      } else {
        chapter.locked = false;
      }
    } else {
      chapter.locked = false;
    }

    return chapter;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Lỗi khi lấy chi tiết chương: ${error.message}`, 500);
  }
};

module.exports = {
  getChaptersByBook,
  getChapterById
};
