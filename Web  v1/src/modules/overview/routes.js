const express = require('express');
const router = express.Router();
const bookService = require('../books/service');

// GET / - Overview stats (public)
router.get('/', async (req, res, next) => {
  try {
    const stats = await bookService.getOverviewStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
