const { z } = require('zod');

const chaptersByBookParams = z.object({
  bookId: z.string()
});

const chapterIdParams = z.object({
  id: z.string()
});

module.exports = {
  chaptersByBookParams,
  chapterIdParams
};
