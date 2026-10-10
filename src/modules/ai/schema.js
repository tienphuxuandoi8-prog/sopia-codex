const { z } = require('zod');

const createThreadSchema = z.object({
  body: z.object({
    bookId: z.string().nullable().optional(),
    chapterId: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
});

const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Tin nhắn không được để trống').max(2000, 'Tin nhắn quá dài'),
    selectedQuote: z.string().max(1000, 'Trích dẫn quá dài').nullable().optional(),
  })
});

module.exports = {
  createThreadSchema,
  sendMessageSchema
};
