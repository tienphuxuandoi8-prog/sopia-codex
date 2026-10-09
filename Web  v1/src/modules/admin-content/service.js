const prisma = require('../../lib/prisma');
const { AppError } = require('../../middleware/errorHandler');
const { logAudit } = require('../audit/service');

/**
 * Tạo slug từ chuỗi (tiếng Việt)
 */
function generateSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** 
 * BOOKS
 */

async function createBook(req, data) {
  const slug = generateSlug(data.title);
  
  const book = await prisma.book.create({
    data: {
      ...data,
      slug,
      status: data.status || 'DRAFT',
    }
  });
  
  await logAudit(req, 'BOOK_CREATE', book.id, { title: book.title });
  return book;
}

async function updateBook(req, id, data) {
  const book = await prisma.book.update({
    where: { id },
    data: {
      ...data,
      ...(data.title ? { slug: generateSlug(data.title) } : {})
    }
  });
  
  await logAudit(req, 'BOOK_UPDATE', id, { updatedFields: Object.keys(data) });
  return book;
}

async function deleteBook(req, id) {
  const book = await prisma.book.delete({
    where: { id }
  });
  
  await logAudit(req, 'BOOK_DELETE', id, { title: book.title });
  return book;
}

async function publishBook(req, id, publish = true) {
  const book = await prisma.book.update({
    where: { id },
    data: {
      status: publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publish ? new Date() : null
    }
  });
  
  await logAudit(req, publish ? 'BOOK_PUBLISH' : 'BOOK_UNPUBLISH', id, {});
  return book;
}

/** 
 * CHAPTERS
 */

async function createChapter(req, data) {
  let { chapterIndex, bookId } = data;
  
  // Tự động tính chapterIndex nếu không được cung cấp
  if (chapterIndex === undefined) {
    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId },
      orderBy: { chapterIndex: 'desc' }
    });
    data.chapterIndex = lastChapter ? lastChapter.chapterIndex + 1 : 1;
  }
  
  const chapter = await prisma.chapter.create({
    data
  });
  
  await logAudit(req, 'CHAPTER_CREATE', chapter.id, { bookId: chapter.bookId, title: chapter.title });
  return chapter;
}

async function updateChapter(req, id, data) {
  const chapter = await prisma.chapter.update({
    where: { id },
    data
  });
  
  await logAudit(req, 'CHAPTER_UPDATE', id, { updatedFields: Object.keys(data) });
  return chapter;
}

async function deleteChapter(req, id) {
  const chapter = await prisma.chapter.delete({
    where: { id }
  });
  
  await logAudit(req, 'CHAPTER_DELETE', id, { title: chapter.title });
  return chapter;
}

/**
 * Phân tích và nhập nội dung chương thông minh từ văn bản thô
 * Dựa trên logic smart ingest cũ chia nhỏ văn bản theo các mốc chương.
 */
async function smartIngestChapters(req, bookId, rawText) {
  // Biểu thức chính quy phát hiện tiêu đề chương
  const regex = /^(Chương|Phần|Quyển|Hồi|Đoạn)\s+[\dIVXLC]+\s*[-:]?\s*(.*)$/gmi;
  
  let match;
  let lastIndex = 0;
  const chaptersData = [];
  
  // Lấy chỉ số chương cuối cùng hiện tại
  const lastChapter = await prisma.chapter.findFirst({
    where: { bookId },
    orderBy: { chapterIndex: 'desc' }
  });
  let currentIndex = lastChapter ? lastChapter.chapterIndex + 1 : 1;
  
  let currentTitle = 'Chương 1'; 
  
  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      const content = rawText.substring(lastIndex, match.index).trim();
      if (content) {
        // Tách đoạn văn bản dựa trên khoảng trắng kép hoặc ký tự xuống dòng
        const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
        chaptersData.push({
          bookId,
          title: currentTitle,
          content: paragraphs,
          chapterIndex: currentIndex++,
        });
      }
    }
    currentTitle = match[0].trim();
    lastIndex = regex.lastIndex;
  }
  
  // Xử lý phần nội dung cuối cùng
  const finalContent = rawText.substring(lastIndex).trim();
  if (finalContent) {
    const paragraphs = finalContent.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
    chaptersData.push({
      bookId,
      title: currentTitle,
      content: paragraphs,
      chapterIndex: currentIndex,
    });
  }
  
  if (chaptersData.length === 0) {
    throw new AppError('Không tìm thấy chương nào trong đoạn văn bản đã cung cấp.', 400);
  }
  
  // Thực hiện giao dịch tạo tất cả các chương
  const result = await prisma.$transaction(
    chaptersData.map(chData => prisma.chapter.create({ data: chData }))
  );
  
  await logAudit(req, 'CHAPTER_SMART_INGEST', bookId, { count: result.length });
  
  return result.length;
}

/**
 * QUOTES
 */

async function createQuote(req, data) {
  const quote = await prisma.quote.create({ data });
  await logAudit(req, 'QUOTE_CREATE', quote.id, {});
  return quote;
}

async function updateQuote(req, id, data) {
  const quote = await prisma.quote.update({ where: { id }, data });
  await logAudit(req, 'QUOTE_UPDATE', id, {});
  return quote;
}

async function deleteQuote(req, id) {
  const quote = await prisma.quote.delete({ where: { id } });
  await logAudit(req, 'QUOTE_DELETE', id, {});
  return quote;
}

async function setDailyQuote(req, id) {
  // Gỡ bỏ cờ isDailyQuote cũ
  await prisma.quote.updateMany({
    where: { isDailyQuote: true },
    data: { isDailyQuote: false }
  });
  
  // Đặt cờ cho quote mới
  const quote = await prisma.quote.update({
    where: { id },
    data: { isDailyQuote: true }
  });
  
  await logAudit(req, 'QUOTE_SET_DAILY', id, {});
  return quote;
}

/**
 * PHILOSOPHERS
 */

async function createPhilosopher(req, data) {
  const slug = generateSlug(data.name);
  const philosopher = await prisma.philosopher.create({ data: { ...data, slug } });
  await logAudit(req, 'PHILOSOPHER_CREATE', philosopher.id, { name: data.name });
  return philosopher;
}

async function updatePhilosopher(req, id, data) {
  const slug = data.name ? generateSlug(data.name) : undefined;
  const updateData = slug ? { ...data, slug } : data;
  const philosopher = await prisma.philosopher.update({ where: { id }, data: updateData });
  await logAudit(req, 'PHILOSOPHER_UPDATE', id, { name: data.name });
  return philosopher;
}

async function deletePhilosopher(req, id) {
  const philosopher = await prisma.philosopher.delete({ where: { id } });
  await logAudit(req, 'PHILOSOPHER_DELETE', id, { name: philosopher.name });
  return philosopher;
}

/**
 * CATEGORIES
 */

async function createCategory(req, data) {
  const slug = generateSlug(data.name);
  const category = await prisma.category.create({ data: { ...data, slug } });
  await logAudit(req, 'CATEGORY_CREATE', category.id, { name: data.name });
  return category;
}

async function updateCategory(req, id, data) {
  const slug = data.name ? generateSlug(data.name) : undefined;
  const updateData = slug ? { ...data, slug } : data;
  const category = await prisma.category.update({ where: { id }, data: updateData });
  await logAudit(req, 'CATEGORY_UPDATE', id, { name: data.name });
  return category;
}

async function deleteCategory(req, id) {
  const category = await prisma.category.delete({ where: { id } });
  await logAudit(req, 'CATEGORY_DELETE', id, { name: category.name });
  return category;
}

module.exports = {
  createBook,
  updateBook,
  deleteBook,
  publishBook,
  createChapter,
  updateChapter,
  deleteChapter,
  smartIngestChapters,
  createQuote,
  updateQuote,
  deleteQuote,
  setDailyQuote,
  createPhilosopher,
  updatePhilosopher,
  deletePhilosopher,
  createCategory,
  updateCategory,
  deleteCategory
};
