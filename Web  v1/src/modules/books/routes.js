const express = require('express');
const router = express.Router();
const bookService = require('./service');
const validate = require('../../middleware/validate');
const { bookQuerySchema, bookIdParams } = require('./schema');

// GET / - List books (public)
router.get('/', validate(bookQuerySchema, 'query'), async (req, res, next) => {
  try {
    // Map category param to categoryId for service
    const params = {
      ...req.query,
      categoryId: req.query.category
    };
    const result = await bookService.getAllBooks(params);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /:slug - Get book by slug (public)
router.get('/:slug', validate(bookIdParams, 'params'), async (req, res, next) => {
  try {
    const book = await bookService.getBookBySlug(req.params.slug);
    res.json(book);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
