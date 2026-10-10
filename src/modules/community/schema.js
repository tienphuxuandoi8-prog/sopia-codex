const { z } = require('zod');

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(1000).optional(),
});

const commentSchema = z.object({
  bookId: z.string(),
  chapterId: z.string().optional(),
  parentId: z.number().int().optional(),
  content: z.string().min(1).max(2000),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

const reportSchema = z.object({
  reason: z.string().max(200).optional(),
});

const bannedWordSchema = z.object({
  word: z.string().min(2).max(50),
});

module.exports = {
  reviewSchema,
  commentSchema,
  updateCommentSchema,
  reportSchema,
  bannedWordSchema,
};
