const { z } = require('zod');

const createThreadSchema = z.object({
  body: z.object({
    bookId: z.string().optional(),
    chapterId: z.string().optional(),
    title: z.string().optional(),
  })
});

const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Tin nhắn không được để trống').max(2000, 'Tin nhắn quá dài'),
    selectedQuote: z.string().max(1000, 'Trích dẫn quá dài').optional(),
  })
});

module.exports = {
  createThreadSchema,
  sendMessageSchema
};
