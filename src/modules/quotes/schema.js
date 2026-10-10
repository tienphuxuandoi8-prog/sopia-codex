const { z } = require('zod');

const quotesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

const quoteIdParams = z.object({
  id: z.string()
});

module.exports = {
  quotesQuerySchema,
  quoteIdParams
};
