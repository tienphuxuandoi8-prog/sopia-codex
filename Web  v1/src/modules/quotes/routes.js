const express = require('express');
const router = express.Router();
const quoteService = require('./service');
const validate = require('../../middleware/validate');
const { quotesQuerySchema, quoteIdParams } = require('./schema');

// GET / - List quotes (public)
router.get('/', validate(quotesQuerySchema, 'query'), async (req, res, next) => {
  try {
    const quotes = await quoteService.getAllQuotes(req.query);
    res.json(quotes);
  } catch (error) {
    next(error);
  }
});

// GET /daily - Daily quote (public)
router.get('/daily', async (req, res, next) => {
  try {
    const quote = await quoteService.getDailyQuote();
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

// POST /:id/share - Increment share count (public)
router.post('/:id/share', validate(quoteIdParams, 'params'), async (req, res, next) => {
  try {
    const result = await quoteService.incrementShare(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
