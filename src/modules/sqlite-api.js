/**
 * SOPHIA CODEX - SQLITE API CONTROLLER
 * Cung cấp đầy đủ các endpoint REST API cho Bảng Quản Trị (Admin Studio) và Độc Giả,
 * kết nối trực tiếp với động cơ CSDL SQLite (node:sqlite) siêu tốc và ổn định.
 */

const express = require('express');
const router = express.Router();
const dbService = require('../../server/db');

// --- OVERVIEW DASHBOARD ---
router.get('/overview', (req, res) => {
  try {
    const stats = dbService.getOverviewStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKS CRUD & CHAPTERS ---
router.get('/books', (req, res) => {
  try {
    const category = req.query.category || null;
    const books = dbService.getAllBooks(category);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/books/:id', (req, res) => {
  try {
    const book = dbService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Không tìm thấy tác phẩm' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books', (req, res) => {
  try {
    const body = req.body;
    if (!body.title || !body.author) {
      return res.status(400).json({ error: 'Tiêu đề và Tác giả là bắt buộc' });
    }
    if (!body.id) {
      body.id = body.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    }
    const newBook = dbService.createBook(body);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/books/:id', (req, res) => {
  try {
    const updated = dbService.updateBook(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/books/:id', (req, res) => {
  try {
    const result = dbService.deleteBook(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/books/:id/chapters', (req, res) => {
  try {
    const chapters = dbService.getChaptersByBook(req.params.id);
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books/:id/smart-ingest', (req, res) => {
  try {
    if (!req.body.rawText) {
      return res.status(400).json({ error: 'Nội dung văn bản (rawText) là bắt buộc' });
    }
    const result = dbService.smartIngestChapters(req.params.id, req.body.rawText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CHAPTERS CRUD ---
router.get('/chapters/:id', (req, res) => {
  try {
    const chap = dbService.getChapterById(req.params.id);
    if (!chap) return res.status(404).json({ error: 'Không tìm thấy chương' });
    res.json(chap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chapters', (req, res) => {
  try {
    const chapId = dbService.createChapter(req.body);
    res.status(201).json({ success: true, id: chapId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/chapters/:id', (req, res) => {
  try {
    const updated = dbService.updateChapter(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/chapters/:id', (req, res) => {
  try {
    const result = dbService.deleteChapter(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- QUOTES CRUD ---
router.get('/quotes', (req, res) => {
  try {
    const quotes = dbService.getAllQuotes(req.query.category);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/quotes/:id', (req, res) => {
  try {
    const quote = dbService.getQuoteById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Không tìm thấy danh ngôn' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/quotes', (req, res) => {
  try {
    const id = dbService.createQuote(req.body);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/quotes/:id', (req, res) => {
  try {
    const updated = dbService.updateQuote(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/quotes/:id', (req, res) => {
  try {
    const result = dbService.deleteQuote(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/quotes/:id/daily', (req, res) => {
  try {
    const result = dbService.setDailyQuote(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/quotes/:id/share', (req, res) => {
  try {
    const result = dbService.incrementQuoteShare(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PHILOSOPHERS CRUD ---
router.get('/philosophers', (req, res) => {
  try {
    const phils = dbService.getAllPhilosophers();
    res.json(phils);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/philosophers/stats', (req, res) => {
  try {
    const stats = dbService.getPhilosophersStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/philosophers/:id', (req, res) => {
  try {
    const phil = dbService.getPhilosopherById(req.params.id);
    if (!phil) return res.status(404).json({ error: 'Không tìm thấy triết gia' });
    res.json(phil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/philosophers', (req, res) => {
  try {
    const id = dbService.createPhilosopher(req.body);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/philosophers/:id', (req, res) => {
  try {
    const updated = dbService.updatePhilosopher(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/philosophers/:id', (req, res) => {
  try {
    const result = dbService.deletePhilosopher(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES ---
router.get('/categories', (req, res) => {
  try {
    const cats = dbService.db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI SOCRATES HUB ---
router.get('/ai/stats', (req, res) => {
  try {
    const stats = dbService.getAiHubStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ai/conversations', (req, res) => {
  try {
    const convs = dbService.getAllAiConversations(req.query.book_id || null);
    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai/conversations', (req, res) => {
  try {
    const created = dbService.createAiConversation(req.body);
    res.status(201).json({ success: true, ...created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/ai/conversations/:id', (req, res) => {
  try {
    const result = dbService.deleteAiConversation(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/ai/conversations', (req, res) => {
  try {
    const result = dbService.clearAiConversations(req.query.book_id || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- READING LOGS ---
router.post('/reading-logs', (req, res) => {
  try {
    const result = dbService.createReadingLog(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATABASE HEALTH & BACKUP ---
router.get('/db/health', (req, res) => {
  try {
    const health = dbService.getDbHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/db/backup', (req, res) => {
  try {
    const result = dbService.backupDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/db/reseed', (req, res) => {
  try {
    const result = dbService.reseedDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
