/**
 * SOPHIA CODEX - FULL-STACK HTTP SERVER & REST API
 * Phục vụ cả giao diện độc giả (index.html), giao diện quản trị (admin.html),
 * và toàn bộ hệ thống REST API tương tác với SQLite Database Engine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const dbService = require('./db.js');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self'; media-src 'self' data: blob:;");
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  let cleaned = str.replace(/[\0\x08\x0B\x0C]/g, '');
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=/gi, '');
  return cleaned;
}

function sanitizeInput(data) {
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' ? sanitizeString(data) : data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  const cleanObj = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      cleanObj[key] = sanitizeString(val);
    } else if (typeof val === 'object' && val !== null) {
      cleanObj[key] = sanitizeInput(val);
    } else {
      cleanObj[key] = val;
    }
  }
  return cleanObj;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    let hasError = false;
    const MAX_SIZE = 5 * 1024 * 1024; // Giới hạn 5MB
    req.on('data', chunk => {
      if (hasError) return;
      size += chunk.length;
      if (size > MAX_SIZE) {
        hasError = true;
        req.pause();
        const err = new Error('Body payload too large');
        err.statusCode = 413;
        return reject(err);
      }
      body += chunk.toString();
    });
    req.on('end', () => {
      if (hasError) return;
      if (!body) return resolve({});
      try {
        const parsed = JSON.parse(body);
        resolve(sanitizeInput(parsed));
      } catch (err) {
        resolve({ raw: sanitizeString(body) });
      }
    });
    req.on('error', err => {
      if (hasError) return;
      hasError = true;
      reject(err);
    });
  });
}

function sendJson(res, statusCode, data) {
  applySecurityHeaders(res);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Bật CORS cho local development
  if (req.method === 'OPTIONS') {
    applySecurityHeaders(res);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  parsedUrl.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // =========================================================================
  // 1. REST API ENDPOINTS (/api/*)
  // =========================================================================
  if (pathname.startsWith('/api/')) {
    try {
      // GET /api/overview
      if (pathname === '/api/overview' && method === 'GET') {
        const stats = dbService.getOverviewStats();
        return sendJson(res, 200, stats);
      }

      // GET /api/books
      if (pathname === '/api/books' && method === 'GET') {
        const categoryId = parsedUrl.query.category || null;
        const books = dbService.getAllBooks(categoryId);
        return sendJson(res, 200, books);
      }

      // GET /api/books/:id
      if (pathname.match(/^\/api\/books\/([^\/]+)$/) && method === 'GET') {
        const bookId = pathname.split('/')[3];
        const book = dbService.getBookById(bookId);
        if (!book) return sendJson(res, 404, { error: 'Không tìm thấy tác phẩm' });
        return sendJson(res, 200, book);
      }

      // POST /api/books (Tạo sách mới)
      if (pathname === '/api/books' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.title || !body.author) {
          return sendJson(res, 400, { error: 'Tiêu đề và Tác giả là bắt buộc' });
        }
        if (!body.id) {
          body.id = body.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        }
        const newBook = dbService.createBook(body);
        return sendJson(res, 201, newBook);
      }

      // PUT /api/books/:id (Cập nhật sách)
      if (pathname.match(/^\/api\/books\/([^\/]+)$/) && method === 'PUT') {
        const bookId = pathname.split('/')[3];
        const body = await parseBody(req);
        const updated = dbService.updateBook(bookId, body);
        return sendJson(res, 200, updated);
      }

      // DELETE /api/books/:id
      if (pathname.match(/^\/api\/books\/([^\/]+)$/) && method === 'DELETE') {
        const bookId = pathname.split('/')[3];
        const result = dbService.deleteBook(bookId);
        return sendJson(res, 200, result);
      }

      // GET /api/books/:id/chapters
      if (pathname.match(/^\/api\/books\/([^\/]+)\/chapters$/) && method === 'GET') {
        const bookId = pathname.split('/')[3];
        const chapters = dbService.getChaptersByBook(bookId);
        return sendJson(res, 200, chapters);
      }

      // POST /api/books/:id/smart-ingest (Nạp nhanh hàng loạt chương)
      if (pathname.match(/^\/api\/books\/([^\/]+)\/smart-ingest$/) && method === 'POST') {
        const bookId = pathname.split('/')[3];
        const body = await parseBody(req);
        if (!body.rawText) {
          return sendJson(res, 400, { error: 'Nội dung văn bản (rawText) là bắt buộc' });
        }
        const result = dbService.smartIngestChapters(bookId, body.rawText);
        return sendJson(res, 200, result);
      }

      // GET /api/chapters/:id
      if (pathname.match(/^\/api\/chapters\/([^\/]+)$/) && method === 'GET') {
        const chapId = pathname.split('/')[3];
        const chapter = dbService.getChapterById(chapId);
        if (!chapter) return sendJson(res, 404, { error: 'Không tìm thấy chương' });
        return sendJson(res, 200, chapter);
      }

      // POST /api/chapters (Tạo chương mới)
      if (pathname === '/api/chapters' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.book_id || !body.title) {
          return sendJson(res, 400, { error: 'book_id và title là bắt buộc' });
        }
        const chapId = dbService.createChapter(body);
        return sendJson(res, 201, { success: true, id: chapId });
      }

      // PUT /api/chapters/:id (Cập nhật chương)
      if (pathname.match(/^\/api\/chapters\/([^\/]+)$/) && method === 'PUT') {
        const chapId = pathname.split('/')[3];
        const body = await parseBody(req);
        const updated = dbService.updateChapter(chapId, body);
        return sendJson(res, 200, updated);
      }

      // DELETE /api/chapters/:id (Xóa chương)
      if (pathname.match(/^\/api\/chapters\/([^\/]+)$/) && method === 'DELETE') {
        const chapId = pathname.split('/')[3];
        const result = dbService.deleteChapter(chapId);
        return sendJson(res, 200, result);
      }

      // GET /api/quotes
      if (pathname === '/api/quotes' && method === 'GET') {
        const quotes = dbService.getAllQuotes();
        return sendJson(res, 200, quotes);
      }

      // POST /api/quotes
      if (pathname === '/api/quotes' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.quote || !body.author) {
          return sendJson(res, 400, { error: 'Nội dung trích dẫn và tác giả là bắt buộc' });
        }
        const created = dbService.createQuote(body);
        return sendJson(res, 201, created);
      }

      // PUT /api/quotes/:id/daily (Đặt làm danh ngôn trong ngày)
      if (pathname.match(/^\/api\/quotes\/(\d+)\/daily$/) && method === 'PUT') {
        const quoteId = parseInt(pathname.split('/')[3]);
        const updated = dbService.setDailyQuote(quoteId);
        return sendJson(res, 200, updated);
      }

      // GET /api/quotes/:id
      if (pathname.match(/^\/api\/quotes\/(\d+)$/) && method === 'GET') {
        const quoteId = parseInt(pathname.split('/')[3]);
        const quote = dbService.getQuoteById(quoteId);
        if (!quote) return sendJson(res, 404, { error: 'Không tìm thấy danh ngôn' });
        return sendJson(res, 200, quote);
      }

      // PUT /api/quotes/:id (Cập nhật danh ngôn)
      if (pathname.match(/^\/api\/quotes\/(\d+)$/) && method === 'PUT') {
        const quoteId = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const updated = dbService.updateQuote(quoteId, body);
        return sendJson(res, 200, updated);
      }

      // DELETE /api/quotes/:id (Xóa danh ngôn)
      if (pathname.match(/^\/api\/quotes\/(\d+)$/) && method === 'DELETE') {
        const quoteId = parseInt(pathname.split('/')[3]);
        const result = dbService.deleteQuote(quoteId);
        return sendJson(res, 200, result);
      }

      // POST /api/quotes/:id/share (Tăng lượt chia sẻ thiệp FB)
      if (pathname.match(/^\/api\/quotes\/(\d+)\/share$/) && method === 'POST') {
        const quoteId = parseInt(pathname.split('/')[3]);
        const updated = dbService.incrementQuoteShare(quoteId);
        return sendJson(res, 200, { success: true, share_count: updated ? updated.shares_count : 0 });
      }

      // GET /api/ai/conversations
      if (pathname === '/api/ai/conversations' && method === 'GET') {
        const bookId = parsedUrl.query.book_id || null;
        const convs = dbService.getAllAiConversations(bookId);
        return sendJson(res, 200, convs);
      }

      // POST /api/ai/conversations
      if (pathname === '/api/ai/conversations' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.question) {
          return sendJson(res, 400, { error: 'Câu hỏi (question) là bắt buộc' });
        }
        const created = dbService.createAiConversation(body);
        return sendJson(res, 201, created);
      }

      // DELETE /api/ai/conversations/:id
      if (pathname.match(/^\/api\/ai\/conversations\/(\d+)$/) && method === 'DELETE') {
        const id = parseInt(pathname.split('/')[4]);
        const result = dbService.deleteAiConversation(id);
        return sendJson(res, 200, result);
      }

      // DELETE /api/ai/conversations (Xóa toàn bộ lịch sử hoặc theo sách)
      if (pathname === '/api/ai/conversations' && method === 'DELETE') {
        const bookId = parsedUrl.query.book_id || null;
        const result = dbService.clearAiConversations(bookId);
        return sendJson(res, 200, result);
      }

      // GET /api/ai/stats
      if (pathname === '/api/ai/stats' && method === 'GET') {
        const stats = dbService.getAiHubStats();
        return sendJson(res, 200, stats);
      }

      // POST /api/reading-logs (Ghi nhận tiến độ đọc sâu từ Độc Giả)
      if (pathname === '/api/reading-logs' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.book_id) {
          return sendJson(res, 400, { error: 'book_id là bắt buộc' });
        }
        const created = dbService.createReadingLog(body);
        return sendJson(res, 201, created);
      }

      // GET /api/philosophers
      if (pathname === '/api/philosophers' && method === 'GET') {
        const phils = dbService.getAllPhilosophers();
        return sendJson(res, 200, phils);
      }

      // GET /api/philosophers/stats
      if (pathname === '/api/philosophers/stats' && method === 'GET') {
        const stats = dbService.getPhilosophersStats();
        return sendJson(res, 200, stats);
      }

      // GET /api/philosophers/:id
      if (pathname.match(/^\/api\/philosophers\/([a-zA-Z0-9_-]+)$/) && method === 'GET') {
        const id = pathname.split('/')[3];
        const phil = dbService.getPhilosopherById(id);
        if (!phil) return sendJson(res, 404, { error: 'Không tìm thấy triết gia' });
        return sendJson(res, 200, phil);
      }

      // POST /api/philosophers
      if (pathname === '/api/philosophers' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.id || !body.name) {
          return sendJson(res, 400, { error: 'id và name là bắt buộc' });
        }
        const created = dbService.createPhilosopher(body);
        return sendJson(res, 201, created);
      }

      // PUT /api/philosophers/:id
      if (pathname.match(/^\/api\/philosophers\/([a-zA-Z0-9_-]+)$/) && method === 'PUT') {
        const id = pathname.split('/')[3];
        const body = await parseBody(req);
        const updated = dbService.updatePhilosopher(id, body);
        return sendJson(res, 200, updated);
      }

      // DELETE /api/philosophers/:id
      if (pathname.match(/^\/api\/philosophers\/([a-zA-Z0-9_-]+)$/) && method === 'DELETE') {
        const id = pathname.split('/')[3];
        const result = dbService.deletePhilosopher(id);
        return sendJson(res, 200, result);
      }

      // GET /api/db/health
      if (pathname === '/api/db/health' && method === 'GET') {
        const health = dbService.getDbHealth();
        return sendJson(res, 200, health);
      }

      // POST /api/db/backup
      if (pathname === '/api/db/backup' && method === 'POST') {
        const backupResult = dbService.backupDatabase();
        return sendJson(res, 200, backupResult);
      }

      // 404 cho API không xác định
      return sendJson(res, 404, { error: 'API route not found' });
    } catch (err) {
      if (err.statusCode !== 413) {
        console.error('API Error:', err);
      }
      const status = err.statusCode || 500;
      return sendJson(res, status, { error: err.message || 'Lỗi hệ thống máy chủ' });
    }
  }

  // =========================================================================
  // 2. STATIC ASSETS & HTML SERVING
  // =========================================================================
  let requestedPath = pathname === '/' ? '/index.html' : pathname;
  // Điều hướng tắt cho admin: /admin -> /admin.html
  if (requestedPath === '/admin') requestedPath = '/admin.html';

  let safePath;
  try {
    const decodedPath = decodeURIComponent(requestedPath);
    if (decodedPath.includes('\0') || requestedPath.includes('\0') || requestedPath.includes('%00')) {
      applySecurityHeaders(res);
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('400 Bad Request');
    }
    safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  } catch (e) {
    applySecurityHeaders(res);
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }

  let filePath = path.join(ROOT_DIR, safePath);
  const relativePath = path.relative(ROOT_DIR, filePath);

  // Ngăn chặn Path Traversal triệt để
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || filePath.includes('\0')) {
    applySecurityHeaders(res);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  try {
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        applySecurityHeaders(res);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>404 Not Found - Sophia Codex</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:50px;background:#F8F5EE;color:#181E1A;">
            <h1 style="color:#C59B4B;">404 - Không tìm thấy trang</h1>
            <p>Tệp tin bạn yêu cầu không tồn tại: <code>${pathname}</code></p>
            <p><a href="/" style="color:#234C38;font-weight:bold;">← Về Thư Viện Độc Giả</a> | <a href="/admin.html" style="color:#A97F33;font-weight:bold;">Vào Trang Quản Trị →</a></p>
          </body>
          </html>
        `);
        return;
      }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    applySecurityHeaders(res);
    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('500 Internal Server Error');
    });

    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
  });
  } catch (err) {
    applySecurityHeaders(res);
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ [UncaughtException]:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ [UnhandledRejection]:', reason);
});

server.on('error', (err) => {
  console.error('⚠️ [Server Error]:', err.message);
});

server.listen(PORT, () => {
  console.log("==================================================================");
  console.log("🏛️  SOPHIA CODEX - HỆ THỐNG MÁY CHỦ & CƠ SỞ DỮ LIỆU ĐÃ SẴN SÀNG");
  console.log("==================================================================");
  console.log(`🌐 Trang Độc Giả:    http://localhost:${PORT}`);
  console.log(`👑 Trang Quản Trị:  http://localhost:${PORT}/admin.html`);
  console.log(`📊 API Tổng Quan:   http://localhost:${PORT}/api/overview`);
  console.log(`💾 CSDL SQLite:     ${path.join(ROOT_DIR, 'data', 'sophia.db')}`);
  console.log("==================================================================");
});

module.exports = server;
