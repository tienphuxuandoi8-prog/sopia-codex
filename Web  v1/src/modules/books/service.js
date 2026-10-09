const prisma = require('../../lib/prisma.js');
const { AppError } = require('../../middleware/errorHandler.js');

/**
 * Lấy danh sách sách phân trang với các bộ lọc
 */
const getAllBooks = async ({ categoryId, search, status, accessLevel, page = 1, limit = 20 }) => {
  try {
    const skip = (page - 1) * limit;
    const where = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } }
        ]
      }),
      // Mặc định chỉ lấy PUBLISHED cho public API
      status: status || 'PUBLISHED',
      ...(accessLevel && { accessLevel })
    };

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          _count: {
            select: { chapters: true }
          }
        }
      })
    ]);

    // Định dạng lại kết quả trả về
    const formattedBooks = books.map(book => ({
      ...book,
      chaptersCount: book._count.chapters,
      _count: undefined
    }));

    return {
      data: formattedBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new AppError(`Lỗi khi lấy danh sách sách: ${error.message}`, 500);
  }
};

/**
 * Lấy chi tiết một sách bằng slug hoặc id
 */
const getBookBySlug = async (slug) => {
  try {
    // Thử tìm theo slug trước, sau đó tìm theo id để tương thích ngược với legacy
    let book = await prisma.book.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      },
      include: {
        category: true,
        philosopher: true,
        _count: {
          select: { chapters: true }
        }
      }
    });

    if (!book) {
      throw new AppError('Không tìm thấy tác phẩm', 404);
    }

    return {
      ...book,
      chaptersCount: book._count.chapters,
      _count: undefined
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Lỗi khi lấy thông tin sách: ${error.message}`, 500);
  }
};

/**
 * Lấy dữ liệu tổng quan cho Dashboard
 */
const getOverviewStats = async () => {
  try {
    const [booksCount, chaptersCount, quotesCount, philosophersCount, readLogs] = await Promise.all([
      prisma.book.count(),
      prisma.chapter.count(),
      prisma.quote.count(),
      prisma.philosopher.count(),
      prisma.readingLog.aggregate({
        _sum: { durationSeconds: true }
      })
    ]);

    const totalReadHours = ((readLogs._sum.durationSeconds || 0) / 3600).toFixed(1);

    return {
      totalBooks: booksCount,
      totalChapters: chaptersCount,
      totalQuotes: quotesCount,
      totalPhilosophers: philosophersCount,
      deepReadingHours: totalReadHours
    };
  } catch (error) {
    throw new AppError(`Lỗi khi lấy thống kê: ${error.message}`, 500);
  }
};

module.exports = {
  getAllBooks,
  getBookBySlug,
  getOverviewStats
};
