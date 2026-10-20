/**
 * SOPHIA CODEX - SQLITE API CONTROLLER
 * Cung cấp đầy đủ các endpoint REST API cho Bảng Quản Trị (Admin Studio) và Độc Giả,
 * kết nối trực tiếp với động cơ CSDL SQLite (node:sqlite) siêu tốc và ổn định.
 *
 * SECURITY: Tất cả route ghi (POST/PUT/DELETE) yêu cầu xác thực Admin từ server-side.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const dbService = require('../../server/db');

// Cấu hình Multer upload ảnh cho bài viết blog
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'posts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ upload các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG'));
  }
});

/**
 * Server-side Admin Auth Middleware cho SQLite API
 * Kiểm tra session hợp lệ và quyền admin từ req.user (được gán bởi sessionMiddleware)
 * Hỗ trợ fallback Authorization Bearer Token
 */
function requireAdminAuth(req, res, next) {
  let user = req.user;

  // Fallback nếu req.user chưa có (ví dụ qua Authorization header token)
  if (!user) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const localUserStore = require('../lib/localUserStore');
        const sessionData = localUserStore.getSession(token);
        if (sessionData && sessionData.user) {
          user = sessionData.user;
          req.user = user;
        }
      } catch (e) {}
    }
  }

  // Kiểm tra người dùng đã đăng nhập chưa
  if (!user) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Yêu cầu đăng nhập tài khoản Quản Trị để thực hiện thao tác này.' }
    });
  }

  // Kiểm tra quyền admin: isSuperAdmin hoặc có email admin hoặc quyền quản trị
  const isAdmin = (
    user.isSuperAdmin === true ||
    user.email === 'admin@sophiacodex.vn' ||
    (Array.isArray(user.permissions) && (
      user.permissions.includes('*') ||
      user.permissions.includes('admin') ||
      user.permissions.some(p => typeof p === 'string' && p.startsWith('admin.'))
    )) ||
    (Array.isArray(user.roles) && (
      user.roles.includes('admin') ||
      user.roles.includes('super_admin') ||
      user.roles.some(r => r === 'admin' || (r && r.key === 'super_admin'))
    ))
  );

  if (!isAdmin) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Bạn không có quyền Quản Trị để thực hiện thao tác này.' }
    });
  }

  next();
}

// --- OVERVIEW DASHBOARD ---
router.get('/overview', (req, res) => {
  try {
    const stats = dbService.getOverviewStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- THÙNG RÁC (RECYCLE BIN & 30-DAY RETENTION) ---
router.get('/trash', requireAdminAuth, (req, res) => {
  try {
    const items = dbService.getTrashItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/trash/restore', requireAdminAuth, (req, res) => {
  try {
    const { type, id } = req.body;
    if (!type || !id) {
      return res.status(400).json({ error: 'Loại mục (type) và ID là bắt buộc' });
    }
    if (type === 'book') {
      const result = dbService.restoreBook(id);
      return res.json(result);
    } else if (type === 'chapter') {
      const result = dbService.restoreChapter(id);
      return res.json(result);
    } else {
      return res.status(400).json({ error: 'Loại mục không hợp lệ' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/trash/:type/:id', requireAdminAuth, (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === 'book') {
      const result = dbService.deleteBook(id, true);
      return res.json(result);
    } else if (type === 'chapter') {
      const result = dbService.deleteChapter(id, true);
      return res.json(result);
    } else {
      return res.status(400).json({ error: 'Loại mục không hợp lệ' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/trash/purge-expired', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.purgeExpiredTrash();
    res.json({ success: true, ...result, message: 'Đã dọn dẹp các mục quá hạn 30 ngày trong thùng rác.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/trash/empty', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.emptyTrash();
    res.json({ success: true, ...result, message: 'Đã xóa sạch toàn bộ thùng rác.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKS CRUD & CHAPTERS ---
router.get('/books', (req, res) => {
  try {
    const category = req.query.category || null;
    const includeDeleted = req.query.include_deleted === 'true';
    const books = dbService.getAllBooks(category, includeDeleted);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/books/:id', (req, res) => {
  try {
    const includeDeleted = req.query.include_deleted === 'true';
    const book = dbService.getBookById(req.params.id, includeDeleted);
    if (!book) return res.status(404).json({ error: 'Không tìm thấy tác phẩm' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books', requireAdminAuth, (req, res) => {
  try {
    const body = req.body;
    if (!body.title || !body.author) {
      return res.status(400).json({ error: 'Tiêu đề và Tác giả là bắt buộc' });
    }
    const newBook = dbService.createBook(body);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/books/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = dbService.updateBook(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy tác phẩm để cập nhật' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/books/:id', requireAdminAuth, (req, res) => {
  try {
    const permanent = req.query.permanent === 'true';
    const result = dbService.deleteBook(req.params.id, permanent);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books/:id/restore', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.restoreBook(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/books/:id/chapters', (req, res) => {
  try {
    const includeDeleted = req.query.include_deleted === 'true';
    const chapters = dbService.getChaptersByBook(req.params.id, includeDeleted);
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books/:id/smart-ingest', requireAdminAuth, (req, res) => {
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
    const includeDeleted = req.query.include_deleted === 'true';
    const chap = dbService.getChapterById(req.params.id, includeDeleted);
    if (!chap) return res.status(404).json({ error: 'Không tìm thấy chương' });
    res.json(chap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chapters', requireAdminAuth, (req, res) => {
  try {
    const chapId = dbService.createChapter(req.body);
    res.status(201).json({ success: true, id: chapId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/chapters/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = dbService.updateChapter(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/chapters/:id', requireAdminAuth, (req, res) => {
  try {
    const permanent = req.query.permanent === 'true';
    const result = dbService.deleteChapter(req.params.id, permanent);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chapters/:id/restore', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.restoreChapter(req.params.id);
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

router.post('/quotes', requireAdminAuth, (req, res) => {
  try {
    const id = dbService.createQuote(req.body);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/quotes/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = dbService.updateQuote(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/quotes/:id', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.deleteQuote(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/quotes/:id/daily', requireAdminAuth, (req, res) => {
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

router.post('/philosophers', requireAdminAuth, (req, res) => {
  try {
    const id = dbService.createPhilosopher(req.body);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/philosophers/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = dbService.updatePhilosopher(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/philosophers/:id', requireAdminAuth, (req, res) => {
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

// --- AI SOCRATES HUB (Admin xem stats/conversations; user tự xóa của mình) ---
router.get('/ai/stats', requireAdminAuth, (req, res) => {
  try {
    const stats = dbService.getAiHubStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ai/conversations', requireAdminAuth, (req, res) => {
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

router.delete('/ai/conversations/:id', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.deleteAiConversation(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/ai/conversations', requireAdminAuth, (req, res) => {
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

// --- DATABASE HEALTH & BACKUP (Admin only) ---
router.get('/db/health', requireAdminAuth, (req, res) => {
  try {
    const health = dbService.getDbHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/db/backup', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.backupDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/db/reseed', requireAdminAuth, (req, res) => {
  try {
    const result = dbService.reseedDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BLOG POSTS API ---
// Public: Xem danh sách bài viết đã xuất bản
router.get('/posts', (req, res) => {
  try {
    const { status = 'PUBLISHED', category, limit, offset, search } = req.query;
    const posts = dbService.getAllBlogPosts({ status, category, limit, offset, search });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Xem tất cả bài viết (kể cả nháp)
router.get('/admin/posts', requireAdminAuth, (req, res) => {
  try {
    const { status, category, limit, offset, search } = req.query;
    const posts = dbService.getAllBlogPosts({ status, category, limit, offset, search });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Chi tiết bài viết theo slug
router.get('/posts/:slug', (req, res) => {
  try {
    const post = dbService.getBlogPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }
    // Tăng view
    dbService.incrementPostViews(post.id);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Tạo bài viết mới
router.post('/posts', requireAdminAuth, (req, res) => {
  try {
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ error: 'Tiêu đề và nội dung bài viết không được để trống' });
    }
    const newPost = dbService.createBlogPost(req.body);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Cập nhật bài viết
router.put('/posts/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = dbService.updateBlogPost(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết để cập nhật' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Xoá bài viết
router.delete('/posts/:id', requireAdminAuth, (req, res) => {
  try {
    const ok = dbService.deleteBlogPost(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Upload hình ảnh cho bài viết (hỗ trợ kéo thả / dán trực tiếp trong editor)
router.post('/posts/upload-image', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message || 'Lỗi khi tải ảnh lên' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Không có tập tin ảnh nào được tải lên' });
    }
    // Trả về đường dẫn ảnh
    const imageUrl = `/uploads/posts/${req.file.filename}`;
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

module.exports = router;
