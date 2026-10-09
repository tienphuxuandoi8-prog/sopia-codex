const express = require('express');
const router = express.Router();
const chapterService = require('./service');
const validate = require('../../middleware/validate');
const { chaptersByBookParams, chapterIdParams } = require('./schema');

// GET /by-book/:bookId - List chapters for a book (public)
router.get('/by-book/:bookId', validate(chaptersByBookParams, 'params'), async (req, res, next) => {
  try {
    const chapters = await chapterService.getChaptersByBook(req.params.bookId);
    res.json(chapters);
  } catch (error) {
    next(error);
  }
});

// GET /:id - Get single chapter (public, but content may be truncated depending on user auth)
router.get('/:id', validate(chapterIdParams, 'params'), async (req, res, next) => {
  try {
    // Nếu có auth middleware gắn user vào req.user thì truyền vào đây
    const user = req.user || null; 
    const chapter = await chapterService.getChapterById(req.params.id, user);
    res.json(chapter);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
