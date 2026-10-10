const prisma = require('../../lib/prisma');
let AppError;
try {
  AppError = require('../../middleware/errorHandler').AppError;
} catch (e) {
  AppError = class extends Error {
    constructor(statusCode, message, code) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.isOperational = true;
    }
  };
}
const { buildSocratesSystemPrompt } = require('../../lib/gemini');

// Cache bộ nhớ tạm để phục vụ khi không có PostgreSQL (như trên Vercel hoặc SQLite) hoặc người dùng Khách
const memoryThreads = new Map();
const memoryUsage = new Map();

const isPrismaActive = () => {
  return !!(process.env.DATABASE_URL && prisma && typeof prisma.$transaction === 'function');
};

const isGuestUser = (userId) => {
  return !userId || typeof userId !== 'string' || userId.startsWith('guest_') || userId.startsWith('sess_');
};

/**
 * Kiểm tra và tiêu thụ quota AI của người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<{used: number, limit: number, remaining: number}>} Thông tin quota
 */
const checkAndConsumeQuota = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `${userId}_${today}`;

  // Nếu là khách hoặc Prisma chưa cấu hình DATABASE_URL
  if (isGuestUser(userId) || !isPrismaActive()) {
    const limit = 50; // Cho phép khách hỏi 50 câu/ngày
    const current = memoryUsage.get(usageKey) || 0;
    if (current >= limit) {
      throw new AppError(429, `Hôm nay bạn đã dùng hết ${limit} câu hỏi AI miễn phí. Nâng cấp Premium để đàm đạo không giới hạn!`, 'AI_QUOTA_EXCEEDED');
    }
    const next = current + 1;
    memoryUsage.set(usageKey, next);
    return {
      used: next,
      limit,
      remaining: limit - next
    };
  }

  // Người dùng đăng nhập có PostgreSQL
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionExpiresAt: true }
    });

    const isPremium = user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    const limit = isPremium ? 100 : 20;

    return await prisma.$transaction(async (tx) => {
      let usage = await tx.aiUsageDaily.findUnique({
        where: {
          userId_date: {
            userId,
            date: today
          }
        }
      });

      if (!usage) {
        usage = await tx.aiUsageDaily.create({
          data: {
            userId,
            date: today,
            count: 0
          }
        });
      }

      if (usage.count >= limit) {
        throw new AppError(429, `Hôm nay bạn đã dùng hết ${limit} câu hỏi AI. Nâng cấp Premium để nhận 100 câu/ngày!`, 'AI_QUOTA_EXCEEDED');
      }

      const updated = await tx.aiUsageDaily.update({
        where: { id: usage.id },
        data: { count: usage.count + 1 }
      });

      return {
        used: updated.count,
        limit,
        remaining: limit - updated.count
      };
    });
  } catch (err) {
    if (err.statusCode === 429) throw err;
    // Fallback sang memory nếu DB lỗi
    const limit = 20;
    const current = memoryUsage.get(usageKey) || 0;
    const next = current + 1;
    memoryUsage.set(usageKey, next);
    return { used: next, limit, remaining: Math.max(0, limit - next) };
  }
};

/**
 * Hoàn trả quota AI khi có lỗi
 * @param {string} userId - ID người dùng
 */
const refundQuota = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `${userId}_${today}`;
  const current = memoryUsage.get(usageKey) || 0;
  if (current > 0) {
    memoryUsage.set(usageKey, current - 1);
  }

  if (!isGuestUser(userId) && isPrismaActive()) {
    try {
      await prisma.aiUsageDaily.updateMany({
        where: { userId, date: today, count: { gt: 0 } },
        data: { count: { decrement: 1 } }
      });
    } catch (error) {
      console.warn('Error refunding quota in DB:', error.message);
    }
  }
};

/**
 * Lấy thông tin quota AI hiện tại
 * @param {string} userId - ID người dùng
 * @returns {Promise<{used: number, limit: number, remaining: number}>}
 */
const getQuota = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `${userId}_${today}`;
  const memoryUsed = memoryUsage.get(usageKey) || 0;

  if (isGuestUser(userId) || !isPrismaActive()) {
    const limit = 50;
    return {
      used: memoryUsed,
      limit,
      remaining: Math.max(0, limit - memoryUsed)
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionExpiresAt: true }
    });

    const isPremium = user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    const limit = isPremium ? 100 : 20;

    const usage = await prisma.aiUsageDaily.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    const used = usage ? usage.count : memoryUsed;
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used)
    };
  } catch (e) {
    return {
      used: memoryUsed,
      limit: 20,
      remaining: Math.max(0, 20 - memoryUsed)
    };
  }
};

/**
 * Lấy danh sách threads của người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<Array>}
 */
const getThreads = async (userId) => {
  if (!isGuestUser(userId) && isPrismaActive()) {
    try {
      return await prisma.aiThread.findMany({
        where: { userId },
        include: {
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (e) {
      // Fallback to memory
    }
  }

  return Array.from(memoryThreads.values())
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

/**
 * Tạo thread mới
 * @param {string} userId - ID người dùng
 * @param {Object} data - Dữ liệu khởi tạo
 * @returns {Promise<Object>} Thread mới
 */
const createThread = async (userId, { bookId, chapterId, title } = {}) => {
  const threadId = 'thread_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date();
  const threadData = {
    id: threadId,
    userId,
    bookId: bookId || null,
    chapterId: chapterId || null,
    title: title || 'Đàm đạo với Socrates',
    messages: [],
    createdAt: now,
    updatedAt: now
  };

  memoryThreads.set(threadId, threadData);

  if (!isGuestUser(userId) && isPrismaActive()) {
    try {
      const dbThread = await prisma.aiThread.create({
        data: {
          userId,
          bookId: bookId || null,
          chapterId: chapterId || null,
          title: title || 'Cuộc trò chuyện mới'
        }
      });
      threadData.id = dbThread.id;
      memoryThreads.set(dbThread.id, threadData);
      return dbThread;
    } catch (e) {
      console.warn('Prisma createThread failed, using memory thread:', e.message);
    }
  }

  return threadData;
};

/**
 * Lấy tin nhắn trong thread
 * @param {string} userId - ID người dùng
 * @param {string} threadId - ID thread
 * @returns {Promise<Array>} Lịch sử tin nhắn
 */
const getThreadMessages = async (userId, threadId) => {
  if (!isGuestUser(userId) && isPrismaActive()) {
    try {
      const thread = await prisma.aiThread.findFirst({
        where: { id: threadId, userId }
      });
      if (thread) {
        return await prisma.aiMessage.findMany({
          where: { threadId },
          orderBy: { createdAt: 'asc' }
        });
      }
    } catch (e) {}
  }

  const memThread = memoryThreads.get(threadId);
  return memThread ? memThread.messages : [];
};

/**
 * Xóa thread
 * @param {string} userId - ID người dùng
 * @param {string} threadId - ID thread
 */
const deleteThread = async (userId, threadId) => {
  memoryThreads.delete(threadId);

  if (!isGuestUser(userId) && isPrismaActive()) {
    try {
      await prisma.aiThread.delete({
        where: { id: threadId }
      });
    } catch (e) {}
  }
};

/**
 * Lưu tin nhắn vào thread
 */
const saveMessage = async (threadId, { role, content, quoteContext } = {}) => {
  const msg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    threadId,
    role,
    content,
    quoteContext: quoteContext || null,
    createdAt: new Date()
  };

  const memThread = memoryThreads.get(threadId);
  if (memThread) {
    memThread.messages = memThread.messages || [];
    memThread.messages.push(msg);
    memThread.updatedAt = new Date();
  }

  if (isPrismaActive()) {
    try {
      await prisma.aiMessage.create({
        data: {
          threadId,
          content,
          role,
          quoteContext: quoteContext || null
        }
      });
      await prisma.aiThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() }
      }).catch(() => {});
    } catch (e) {
      // Ignore if Prisma failed
    }
  }

  return msg;
};

/**
 * Chuẩn bị ngữ cảnh và lịch sử hội thoại
 * @param {string} userId - ID người dùng
 * @param {string} threadId - ID thread
 * @param {string} selectedQuote - Trích dẫn
 * @returns {Promise<Object>} Ngữ cảnh và lịch sử
 */
const prepareContextAndHistory = async (userId, threadId, selectedQuote) => {
  let thread = memoryThreads.get(threadId);

  if (!thread && !isGuestUser(userId) && isPrismaActive()) {
    try {
      thread = await prisma.aiThread.findFirst({
        where: { id: threadId, userId },
        include: {
          book: true,
          chapter: true
        }
      });
      if (thread) {
        memoryThreads.set(threadId, thread);
      }
    } catch (e) {}
  }

  // Nếu không tìm thấy thread, tạo tự động trên bộ nhớ
  if (!thread) {
    thread = {
      id: threadId,
      userId,
      bookId: null,
      chapterId: null,
      title: 'Đàm đạo với Socrates',
      messages: []
    };
    memoryThreads.set(threadId, thread);
  }

  // Lấy thông tin sách nếu có bookId
  let bookTitle = thread.book?.title;
  let bookAuthor = thread.book?.author;
  let chapterTitle = thread.chapter?.title;
  let chapterContent = thread.chapter?.content;

  if (!bookTitle && thread.bookId) {
    try {
      const dbService = require('../../../server/db');
      const b = dbService.getBookById(thread.bookId);
      if (b) {
        bookTitle = b.title;
        bookAuthor = b.author;
      }
    } catch (e) {}
  }

  // Chuẩn bị lịch sử tin nhắn
  const rawMessages = thread.messages || [];
  const recentMessages = rawMessages.slice(-10);

  const history = recentMessages.map(msg => ({
    role: msg.role === 'AI' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const systemPrompt = buildSocratesSystemPrompt({
    bookTitle,
    author: bookAuthor,
    chapterTitle,
    chapterContent,
    selectedQuote
  });

  return { systemPrompt, history, thread, bookTitle };
};

module.exports = {
  checkAndConsumeQuota,
  refundQuota,
  getQuota,
  getThreads,
  createThread,
  getThreadMessages,
  deleteThread,
  saveMessage,
  prepareContextAndHistory
};
