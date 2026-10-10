const prisma = require('../../lib/prisma');
let AppError;
try {
  AppError = require('../../middleware/errorHandler').AppError;
} catch (e) {
  // Fallback in case path or export is different
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

/**
 * Kiểm tra và tiêu thụ quota AI của người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<{used: number, limit: number, remaining: number}>} Thông tin quota
 */
const checkAndConsumeQuota = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionExpiresAt: true }
  });

  const isPremium = user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
  const limit = isPremium ? 100 : 10;
  const today = new Date().toISOString().split('T')[0];

  return prisma.$transaction(async (tx) => {
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
};

/**
 * Hoàn trả quota AI khi có lỗi
 * @param {string} userId - ID người dùng
 */
const refundQuota = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    await prisma.aiUsageDaily.updateMany({
      where: { userId, date: today, count: { gt: 0 } },
      data: { count: { decrement: 1 } }
    });
  } catch (error) {
    console.error('Error refunding quota:', error);
  }
};

/**
 * Lấy thông tin quota AI hiện tại
 * @param {string} userId - ID người dùng
 * @returns {Promise<{used: number, limit: number, remaining: number}>}
 */
const getQuota = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionExpiresAt: true }
  });

  const isPremium = user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
  const limit = isPremium ? 100 : 10;
  const today = new Date().toISOString().split('T')[0];

  const usage = await prisma.aiUsageDaily.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    }
  });

  const used = usage ? usage.count : 0;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used)
  };
};

/**
 * Lấy danh sách threads của người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<Array>}
 */
const getThreads = async (userId) => {
  return prisma.aiThread.findMany({
    where: { userId },
    include: {
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

/**
 * Tạo thread mới
 * @param {string} userId - ID người dùng
 * @param {Object} data - Dữ liệu khởi tạo
 * @returns {Promise<Object>} Thread mới
 */
const createThread = async (userId, { bookId, chapterId, title }) => {
  return prisma.aiThread.create({
    data: {
      userId,
      bookId,
      chapterId,
      title: title || 'Cuộc trò chuyện mới'
    }
  });
};

/**
 * Lấy tin nhắn trong thread
 * @param {string} userId - ID người dùng
 * @param {string} threadId - ID thread
 * @returns {Promise<Array>} Lịch sử tin nhắn
 */
const getThreadMessages = async (userId, threadId) => {
  const thread = await prisma.aiThread.findFirst({
    where: { id: threadId, userId }
  });

  if (!thread) {
    throw new AppError(404, 'Không tìm thấy cuộc hội thoại');
  }

  return prisma.aiMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' }
  });
};

/**
 * Xóa thread
 * @param {string} userId - ID người dùng
 * @param {string} threadId - ID thread
 */
const deleteThread = async (userId, threadId) => {
  const thread = await prisma.aiThread.findFirst({
    where: { id: threadId, userId }
  });

  if (!thread) {
    throw new AppError(404, 'Không tìm thấy cuộc hội thoại');
  }

  await prisma.aiThread.delete({
    where: { id: threadId }
  });
};

/**
 * Chuẩn bị ngữ cảnh và lịch sử hội thoại
 * @param {string} userId - ID người dùng
 * @param {string} threadId - ID thread
 * @param {string} selectedQuote - Trích dẫn
 * @returns {Promise<Object>} Ngữ cảnh và lịch sử
 */
const prepareContextAndHistory = async (userId, threadId, selectedQuote) => {
  const thread = await prisma.aiThread.findFirst({
    where: { id: threadId, userId },
    include: {
      book: true,
      chapter: true
    }
  });

  if (!thread) {
    throw new AppError(404, 'Không tìm thấy cuộc hội thoại');
  }

  const rawMessages = await prisma.aiMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const history = rawMessages.reverse().map(msg => ({
    role: msg.role === 'AI' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const systemPrompt = buildSocratesSystemPrompt({
    bookTitle: thread.book?.title,
    author: thread.book?.author,
    chapterTitle: thread.chapter?.title,
    chapterContent: thread.chapter?.content,
    selectedQuote
  });

  return { systemPrompt, history, thread };
};

module.exports = {
  checkAndConsumeQuota,
  refundQuota,
  getQuota,
  getThreads,
  createThread,
  getThreadMessages,
  deleteThread,
  prepareContextAndHistory
};
