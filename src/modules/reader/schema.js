const { z } = require('zod');

const progressSchema = z.object({
  chapterId: z.string({ required_error: "chapterId is required" }),
  paragraphIndex: z.number().optional(),
  progressPct: z.number().min(0).max(100)
});

const bookshelfSchema = z.object({
  shelf: z.enum(["WANT", "READING", "FINISHED"]),
  isFavorite: z.boolean().optional()
});

const createHighlightSchema = z.object({
  chapterId: z.string({ required_error: "chapterId is required" }),
  paragraphIndex: z.number(),
  startOffset: z.number(),
  endOffset: z.number(),
  quoteText: z.string().min(1),
  color: z.string().optional().default('gold'),
  note: z.string().optional()
});

const updateHighlightSchema = z.object({
  color: z.string().optional(),
  note: z.string().optional()
});

const sessionLogSchema = z.object({
  bookId: z.string({ required_error: "bookId is required" }),
  chapterId: z.string().optional(),
  durationSeconds: z.number().min(1),
  scrollDepth: z.number().optional(),
  device: z.string().optional()
});

module.exports = {
  progressSchema,
  bookshelfSchema,
  createHighlightSchema,
  updateHighlightSchema,
  sessionLogSchema
};
