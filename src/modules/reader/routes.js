const express = require('express');
const { requireAuth } = require('../../middleware/requireAuth');
const { validate } = require('../../middleware/validate');
const service = require('./service');
const {
  progressSchema,
  bookshelfSchema,
  createHighlightSchema,
  updateHighlightSchema,
  sessionLogSchema
} = require('./schema');

const router = express.Router();

router.use(requireAuth);

router.get('/progress', async (req, res, next) => {
  try {
    const data = await service.getAllProgress(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/progress/:bookId', async (req, res, next) => {
  try {
    const data = await service.getBookProgress(req.user.id, req.params.bookId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/progress/:bookId', validate(progressSchema), async (req, res, next) => {
  try {
    const data = await service.saveProgress(req.user.id, req.params.bookId, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/bookshelf', async (req, res, next) => {
  try {
    const data = await service.getBookshelf(req.user.id, req.query.shelf);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/bookshelf/:bookId', validate(bookshelfSchema), async (req, res, next) => {
  try {
    const data = await service.updateBookshelfItem(req.user.id, req.params.bookId, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/bookshelf/:bookId', async (req, res, next) => {
  try {
    await service.removeBookshelfItem(req.user.id, req.params.bookId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/highlights', async (req, res, next) => {
  try {
    const data = await service.getHighlights(req.user.id, {
      chapterId: req.query.chapterId,
      bookId: req.query.bookId
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/highlights', validate(createHighlightSchema), async (req, res, next) => {
  try {
    const data = await service.createHighlight(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.patch('/highlights/:id', validate(updateHighlightSchema), async (req, res, next) => {
  try {
    const data = await service.updateHighlight(req.user.id, req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/highlights/:id', async (req, res, next) => {
  try {
    await service.deleteHighlight(req.user.id, req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post('/sessions', validate(sessionLogSchema), async (req, res, next) => {
  try {
    const data = await service.recordReadingSession(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
