const { z } = require('zod');

const bookQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).optional(),
  accessLevel: z.enum(['FREE', 'PREMIUM']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

const bookIdParams = z.object({
  slug: z.string()
});

module.exports = {
  bookQuerySchema,
  bookIdParams
};
