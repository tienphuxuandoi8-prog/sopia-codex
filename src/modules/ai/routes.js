const express = require('express');
const { requireAuth } = require('../../middleware/requireAuth');
const validate = require('../../middleware/validate');
const { createThreadSchema, sendMessageSchema } = require('./schema');
const aiService = require('./service');
const { streamSocratesResponse } = require('../../lib/gemini');
const prisma = require('../../lib/prisma');

const router = express.Router();

router.use(requireAuth);

/**
 * GET /quota
 */
router.get('/quota', async (req, res, next) => {
  try {
    const quota = await aiService.getQuota(req.user.id);
    res.json({ success: true, data: quota });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /threads
 */
router.get('/threads', async (req, res, next) => {
  try {
    const threads = await aiService.getThreads(req.user.id);
    res.json({ success: true, data: threads });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /threads
 */
router.post('/threads', validate(createThreadSchema), async (req, res, next) => {
  try {
    const thread = await aiService.createThread(req.user.id, req.body);
    res.status(201).json({ success: true, data: thread });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /threads/:id
 */
router.get('/threads/:id', async (req, res, next) => {
  try {
    const messages = await aiService.getThreadMessages(req.user.id, req.params.id);
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /threads/:id
 */
router.delete('/threads/:id', async (req, res, next) => {
  try {
    await aiService.deleteThread(req.user.id, req.params.id);
    res.json({ success: true, message: 'Đã xóa hội thoại' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /threads/:id/messages
 */
router.post('/threads/:id/messages', validate(sendMessageSchema), async (req, res, next) => {
  const userId = req.user.id;
  const threadId = req.params.id;
  const { message, selectedQuote } = req.body;

  try {
    // 1. Consume quota
    await aiService.checkAndConsumeQuota(userId);

    // 2. Chuẩn bị ngữ cảnh
    const { systemPrompt, history } = await aiService.prepareContextAndHistory(userId, threadId, selectedQuote);

    // 3. Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    // 4. Save user message to DB
    const userMessage = await prisma.aiMessage.create({
      data: {
        threadId,
        content: message,
        role: 'USER',
        quoteContext: selectedQuote
      }
    });

    // 5. Call Gemini
    const { text: finalAiText } = await streamSocratesResponse({
      systemPrompt,
      history,
      message,
      onChunk: (textChunk) => {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    });

    // 6. Save AI message to DB
    await prisma.aiMessage.create({
      data: {
        threadId,
        content: finalAiText,
        role: 'AI'
      }
    });

    // Update thread updatedAt
    await prisma.aiThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    if (error.isOperational) {
      if (!res.headersSent) {
        return next(error);
      }
    }
    
    // Refund quota on error if we already consumed it
    if (error.code !== 'AI_QUOTA_EXCEEDED') {
      await aiService.refundQuota(userId);
    }
    
    console.error('SSE Error:', error);
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
