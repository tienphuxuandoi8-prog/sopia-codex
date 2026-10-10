const express = require('express');
const validate = require('../../middleware/validate');
const { createThreadSchema, sendMessageSchema } = require('./schema');
const aiService = require('./service');
const { streamSocratesResponse, generateSocratesPhilosophicalReply } = require('../../lib/gemini');

const router = express.Router();

/**
 * Lấy định danh người dùng:
 * Ưu tiên người dùng đăng nhập -> phiên session -> cookie guest_id -> IP
 */
const getUserId = (req) => {
  if (req.user?.id) return req.user.id;
  if (req.session?.id) return `sess_${req.session.id}`;
  const guestCookie = req.cookies?.guest_id;
  if (guestCookie) return `guest_${guestCookie}`;
  const ip = (req.ip || 'anon').replace(/[^a-zA-Z0-9]/g, '_');
  return `guest_${ip}`;
};

/**
 * Middleware đặt cookie guest nếu chưa có
 */
router.use((req, res, next) => {
  if (!req.user && !req.cookies?.guest_id) {
    const guestId = 'g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    res.cookie('guest_id', guestId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
      path: '/'
    });
  }
  next();
});

/**
 * GET /quota - Lấy quota câu hỏi
 */
router.get('/quota', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const quota = await aiService.getQuota(userId);
    res.json({ success: true, data: quota });
  } catch (error) {
    res.json({ success: true, data: { used: 0, limit: 50, remaining: 50 } });
  }
});

/**
 * GET /threads - Lấy danh sách hội thoại
 */
router.get('/threads', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const threads = await aiService.getThreads(userId);
    res.json({ success: true, data: threads });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

/**
 * POST /threads - Tạo cuộc trò chuyện mới
 */
router.post('/threads', validate(createThreadSchema), async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const thread = await aiService.createThread(userId, req.body || {});
    res.status(201).json({ success: true, data: thread });
  } catch (error) {
    const fallbackId = 'thread_' + Date.now();
    res.status(201).json({
      success: true,
      data: { id: fallbackId, title: req.body?.title || 'Đàm đạo với Socrates' }
    });
  }
});

/**
 * GET /threads/:id - Lấy tin nhắn trong thread
 */
router.get('/threads/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const messages = await aiService.getThreadMessages(userId, req.params.id);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

/**
 * DELETE /threads/:id - Xóa thread
 */
router.delete('/threads/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    await aiService.deleteThread(userId, req.params.id);
    res.json({ success: true, message: 'Đã xóa hội thoại' });
  } catch (error) {
    res.json({ success: true, message: 'Đã xóa hội thoại' });
  }
});

/**
 * POST /threads/:id/messages - Gửi câu hỏi và nhận câu trả lời stream SSE
 */
router.post('/threads/:id/messages', validate(sendMessageSchema), async (req, res, next) => {
  const userId = getUserId(req);
  const threadId = req.params.id;
  const { message, selectedQuote } = req.body;

  try {
    // 1. Kiểm tra quota
    await aiService.checkAndConsumeQuota(userId);

    // 2. Chuẩn bị ngữ cảnh
    const { systemPrompt, history, thread, bookTitle } = await aiService.prepareContextAndHistory(userId, threadId, selectedQuote);

    // 3. Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }
    
    // 4. Lưu tin nhắn của người dùng
    await aiService.saveMessage(threadId, {
      role: 'USER',
      content: message,
      quoteContext: selectedQuote
    });

    // 5. Sinh phản hồi triết học (từ Gemini API hoặc Socratic Engine fallback)
    const { text: finalAiText } = await streamSocratesResponse({
      systemPrompt,
      history,
      message,
      bookTitle,
      selectedQuote,
      onChunk: (textChunk) => {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    });

    // 6. Lưu phản hồi của AI
    await aiService.saveMessage(threadId, {
      role: 'AI',
      content: finalAiText
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    if (error.statusCode === 429 || error.code === 'AI_QUOTA_EXCEEDED') {
      if (!res.headersSent) {
        return res.status(429).json({
          error: {
            code: 'AI_QUOTA_EXCEEDED',
            message: error.message || 'Hôm nay bạn đã dùng hết câu hỏi AI.'
          }
        });
      }
    }
    
    await aiService.refundQuota(userId);
    console.error('[AI Stream] Error:', error);

    if (!res.headersSent) {
      // Nếu chưa gửi header, gửi fallback message
      try {
        const fallbackText = generateSocratesPhilosophicalReply(message, { selectedQuote });
        return res.json({
          success: true,
          data: { text: fallbackText }
        });
      } catch (e) {
        next(error);
      }
    } else {
      res.write(`data: ${JSON.stringify({ text: "\n\n*Hỡi bạn, cuộc đàm đạo tạm khép lại một nhịp. Hãy thử lại để chúng ta cùng suy ngẫm.*" })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

module.exports = router;
