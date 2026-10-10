const prisma = require('../../lib/prisma.js');
const { AppError } = require('../../middleware/errorHandler.js');

/**
 * Lấy danh sách tất cả các triết gia kèm số lượng sách
 */
const getAllPhilosophers = async () => {
  try {
    const philosophers = await prisma.philosopher.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { books: true }
        }
      }
    });

    return philosophers.map(p => ({
      ...p,
      booksCount: p._count.books,
      _count: undefined
    }));
  } catch (error) {
    throw new AppError(`Lỗi khi lấy danh sách triết gia: ${error.message}`, 500);
  }
};

/**
 * Lấy chi tiết một triết gia bằng slug (hoặc id)
 */
const getPhilosopherBySlug = async (slug) => {
  try {
    const philosopher = await prisma.philosopher.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            status: true
          },
          where: {
            status: 'PUBLISHED'
          }
        },
        _count: {
          select: { books: true }
        }
      }
    });

    if (!philosopher) {
      throw new AppError('Không tìm thấy triết gia', 404);
    }

    return {
      ...philosopher,
      booksCount: philosopher._count.books,
      _count: undefined
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Lỗi khi lấy chi tiết triết gia: ${error.message}`, 500);
  }
};

module.exports = {
  getAllPhilosophers,
  getPhilosopherBySlug
};
