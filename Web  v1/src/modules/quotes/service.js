const prisma = require('../../lib/prisma.js');
const { AppError } = require('../../middleware/errorHandler.js');

/**
 * Lấy danh sách danh ngôn (có phân trang)
 */
const getAllQuotes = async ({ page = 1, limit = 20 }) => {
  try {
    const skip = (page - 1) * limit;

    const [total, quotes] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.findMany({
        skip,
        take: limit,
        orderBy: [
          { isDaily: 'desc' },
          { id: 'desc' }
        ],
        include: {
          book: {
            select: { id: true, title: true, slug: true }
          }
        }
      })
    ]);

    return {
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new AppError(`Lỗi khi lấy danh sách danh ngôn: ${error.message}`, 500);
  }
};

/**
 * Lấy danh ngôn của ngày hôm nay (hoặc một câu random nếu không có)
 */
const getDailyQuote = async () => {
  try {
    let quote = await prisma.quote.findFirst({
      where: { isDaily: true },
      include: {
        book: {
          select: { id: true, title: true, slug: true }
        }
      }
    });

    if (!quote) {
      // Fallback: Lấy ngẫu nhiên hoặc câu mới nhất
      quote = await prisma.quote.findFirst({
        orderBy: { id: 'desc' },
        include: {
          book: {
            select: { id: true, title: true, slug: true }
          }
        }
      });
    }

    if (!quote) {
      throw new AppError('Không có danh ngôn nào trong hệ thống', 404);
    }

    return quote;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Lỗi khi lấy danh ngôn hàng ngày: ${error.message}`, 500);
  }
};

/**
 * Tăng số lượt chia sẻ của danh ngôn
 */
const incrementShare = async (id) => {
  try {
    const quote = await prisma.quote.update({
      where: { id: id },
      data: {
        sharesCount: {
          increment: 1
        }
      }
    });

    return { success: true, share_count: quote.sharesCount };
  } catch (error) {
    throw new AppError(`Lỗi khi tăng lượt chia sẻ danh ngôn: ${error.message}`, 500);
  }
};

module.exports = {
  getAllQuotes,
  getDailyQuote,
  incrementShare
};
