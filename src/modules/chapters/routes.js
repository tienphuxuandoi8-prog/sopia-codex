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
    try {
      const dbService = require('../../../server/db');
      const book = dbService.getBookById(req.params.bookId);
      if (book && book.chapters) {
        return res.json(book.chapters);
      }
    } catch (e) {}
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
    try {
      const dbService = require('../../../server/db');
      const chap = dbService.getChapterById ? dbService.getChapterById(req.params.id) : null;
      if (chap) return res.json(chap);
    } catch (e) {}
    next(error);
  }
});

module.exports = router;
