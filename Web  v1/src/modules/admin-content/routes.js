const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../../middleware/requireAuth');
const { requirePermission } = require('../../middleware/requirePermission');
const service = require('./service');
const { uploadImage } = require('../../lib/storage');
const { AppError } = require('../../middleware/errorHandler');

const router = express.Router();

// Sử dụng multer cho việc upload bằng memory storage
const upload = multer({ storage: multer.memoryStorage() });

// -- BOOKS --
router.post('/books', requireAuth, requirePermission('book.create'), async (req, res, next) => {
  try {
    const book = await service.createBook(req, req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.put('/books/:id', requireAuth, requirePermission('book.update'), async (req, res, next) => {
  try {
    const book = await service.updateBook(req, req.params.id, req.body);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.delete('/books/:id', requireAuth, requirePermission('book.delete'), async (req, res, next) => {
  try {
    await service.deleteBook(req, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/books/:id/publish', requireAuth, requirePermission('book.publish'), async (req, res, next) => {
  try {
    const { publish } = req.body;
    const book = await service.publishBook(req, req.params.id, publish !== false);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

// -- CHAPTERS --
router.post('/chapters', requireAuth, requirePermission('chapter.create'), async (req, res, next) => {
  try {
    const chapter = await service.createChapter(req, req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
});

router.put('/chapters/:id', requireAuth, requirePermission('chapter.update'), async (req, res, next) => {
  try {
    const chapter = await service.updateChapter(req, req.params.id, req.body);
    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
});

router.delete('/chapters/:id', requireAuth, requirePermission('chapter.delete'), async (req, res, next) => {
  try {
    await service.deleteChapter(req, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/chapters/smart-ingest', requireAuth, requirePermission('chapter.create'), async (req, res, next) => {
  try {
    const { bookId, rawText } = req.body;
    const count = await service.smartIngestChapters(req, bookId, rawText);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// -- QUOTES --
router.post('/quotes', requireAuth, requirePermission('quote.manage'), async (req, res, next) => {
  try {
    const quote = await service.createQuote(req, req.body);
    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
});

router.put('/quotes/:id', requireAuth, requirePermission('quote.manage'), async (req, res, next) => {
  try {
    const quote = await service.updateQuote(req, req.params.id, req.body);
    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
});

router.delete('/quotes/:id', requireAuth, requirePermission('quote.manage'), async (req, res, next) => {
  try {
    await service.deleteQuote(req, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/quotes/:id/daily', requireAuth, requirePermission('quote.manage'), async (req, res, next) => {
  try {
    const quote = await service.setDailyQuote(req, req.params.id);
    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
});

// -- PHILOSOPHERS --
router.post('/philosophers', requireAuth, requirePermission('philosopher.manage'), async (req, res, next) => {
  try {
    const philosopher = await service.createPhilosopher(req, req.body);
    res.status(201).json({ success: true, data: philosopher });
  } catch (error) {
    next(error);
  }
});

router.put('/philosophers/:id', requireAuth, requirePermission('philosopher.manage'), async (req, res, next) => {
  try {
    const philosopher = await service.updatePhilosopher(req, req.params.id, req.body);
    res.json({ success: true, data: philosopher });
  } catch (error) {
    next(error);
  }
});

router.delete('/philosophers/:id', requireAuth, requirePermission('philosopher.manage'), async (req, res, next) => {
  try {
    await service.deletePhilosopher(req, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// -- CATEGORIES --
router.post('/categories', requireAuth, requirePermission('category.manage'), async (req, res, next) => {
  try {
    const category = await service.createCategory(req, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.put('/categories/:id', requireAuth, requirePermission('category.manage'), async (req, res, next) => {
  try {
    const category = await service.updateCategory(req, req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', requireAuth, requirePermission('category.manage'), async (req, res, next) => {
  try {
    await service.deleteCategory(req, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// -- MEDIA --
router.post('/media/upload', requireAuth, requirePermission('media.upload'), upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError('Không có file được tải lên.', 400);
    }
    
    const folder = req.body.folder || 'covers';
    const url = await uploadImage(file.buffer, file.originalname, file.mimetype, folder);
    
    res.json({ success: true, data: { url } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
