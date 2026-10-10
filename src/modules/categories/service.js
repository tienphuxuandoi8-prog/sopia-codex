const prisma = require('../../lib/prisma.js');
const { AppError } = require('../../middleware/errorHandler.js');

/**
 * Lấy danh sách chuyên mục kèm số lượng sách (đã xuất bản)
 */
const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            books: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    return categories.map(c => ({
      ...c,
      booksCount: c._count.books,
      _count: undefined
    }));
  } catch (error) {
    throw new AppError(`Lỗi khi lấy danh sách chuyên mục: ${error.message}`, 500);
  }
};

module.exports = {
  getAllCategories
};
