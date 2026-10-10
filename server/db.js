/**
 * SOPHIA CODEX - CORE SQLITE DATABASE ENGINE
 * Sử dụng native node:sqlite của Node.js 24 (Zero external dependencies)
 * Quản lý toàn bộ kiệt tác triết học, chương mục, tác giả, danh ngôn và thống kê đọc sâu.
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
let DB_PATH = path.join(DATA_DIR, 'sophia.db');

// Hỗ trợ môi trường Serverless (Vercel / AWS Lambda): sao chép sang /tmp để có quyền đọc-ghi
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const tmpDbPath = path.join('/tmp', 'sophia.db');
  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, tmpDbPath);
    }
    DB_PATH = tmpDbPath;
  } catch (err) {
    console.warn('[SQLite] Không thể sao chép DB sang /tmp:', err.message);
  }
} else {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const db = new DatabaseSync(DB_PATH);

// Kích hoạt WAL mode, busy_timeout và Foreign Keys để tối ưu hiệu năng và an toàn đồng thời
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  // Bỏ qua nếu môi trường chỉ đọc
}

/**
 * Khởi tạo lược đồ cơ sở dữ liệu quan hệ hoàn chỉnh
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      count INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS philosophers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      era TEXT,
      school TEXT,
      avatar TEXT,
      fallback_avatar TEXT,
      quote TEXT,
      bio TEXT,
      book_id TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      original_title TEXT,
      author TEXT NOT NULL,
      author_role TEXT,
      school TEXT,
      category_id TEXT,
      read_time TEXT,
      audio_duration TEXT,
      year TEXT,
      rating REAL DEFAULT 5.0,
      readers_count TEXT DEFAULT '0',
      featured INTEGER DEFAULT 0,
      tagline TEXT,
      cover_image TEXT,
      fallback_cover TEXT,
      bgm_theme TEXT,
      studio_audio_url TEXT,
      cover_theme_json TEXT,
      summary TEXT,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      chapter_index INTEGER NOT NULL,
      chapter_number TEXT,
      title TEXT NOT NULL,
      subtitle TEXT,
      paragraphs_json TEXT NOT NULL,
      reading_time_minutes INTEGER DEFAULT 5,
      audio_url TEXT,
      takeaways_json TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      school TEXT,
      context TEXT,
      book_id TEXT,
      is_daily INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reading_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      chapter_id TEXT,
      duration_seconds INTEGER DEFAULT 60,
      scroll_depth INTEGER DEFAULT 50,
      device TEXT DEFAULT 'desktop',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT,
      question TEXT NOT NULL,
      response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

/**
 * Tự động nạp dữ liệu ban đầu từ mã nguồn Web v1 nếu database rỗng
 */
function reseedDatabase() {
  db.exec('DELETE FROM chapters;');
  db.exec('DELETE FROM books;');
  db.exec('DELETE FROM philosophers;');
  db.exec('DELETE FROM categories;');
  seedInitialDataIfEmpty(true);
}

function seedInitialDataIfEmpty(force = false) {
  if (!force) {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM books').get();
    if (countRow && countRow.count > 0) {
      return; // Đã có dữ liệu
    }
  }

  console.log('⚡ Cơ sở dữ liệu SQLite mới khởi tạo. Đang tự động nạp dữ liệu từ thư viện hiện có...');

  // Mock global window object để require các file sách
  const sandbox = {};
  sandbox.window = sandbox;
  const vm = require('vm');
  const context = vm.createContext(sandbox);

  const booksDataFiles = ['suy-tuong.js', 'dao-duc-kinh.js', 'cong-hoa.js', 'zarathustra.js', 'ban-ve-tu-do.js'];
  for (const f of booksDataFiles) {
    const fPath = path.join(__dirname, '..', 'js', 'books-data', f);
    if (fs.existsSync(fPath)) {
      vm.runInContext(fs.readFileSync(fPath, 'utf8'), context);
    }
  }

  // Đọc dữ liệu từ data.js
  const dataFile = path.join(__dirname, '..', 'js', 'data.js');
  let dataContent = fs.readFileSync(dataFile, 'utf8');
  // Chuyển `const PHILOSOPHY_DATA =` thành `var PHILOSOPHY_DATA =` để có trong sandbox global
  dataContent = dataContent.replace(/const PHILOSOPHY_DATA\s*=/, 'var PHILOSOPHY_DATA =');
  vm.runInContext(dataContent, context);

  const philosophyData = sandbox.PHILOSOPHY_DATA;

  if (!philosophyData) {
    console.error('Không tìm thấy dữ liệu PHILOSOPHY_DATA để nạp.');
    return;
  }

  // 1. Nạp Categories
  const insertCat = db.prepare('INSERT OR REPLACE INTO categories (id, name, icon, count, sort_order) VALUES (?, ?, ?, ?, ?)');
  let catIndex = 1;
  for (const cat of philosophyData.categories || []) {
    insertCat.run(cat.id, cat.name, cat.icon || 'book-open', cat.count || 0, catIndex++);
  }

  // 2. Nạp Philosophers
  const insertPhil = db.prepare(`
    INSERT OR REPLACE INTO philosophers (id, name, title, era, school, avatar, fallback_avatar, quote, bio, book_id, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of philosophyData.philosophers || []) {
    insertPhil.run(
      p.id,
      p.name,
      p.title || '',
      p.era || '',
      p.school || '',
      p.avatar || '',
      p.fallbackAvatar || '',
      p.quote || '',
      p.bio || '',
      p.bookId || '',
      p.color || ''
    );
  }

  // 3. Nạp Books & Chapters
  const insertBook = db.prepare(`
    INSERT OR REPLACE INTO books (
      id, title, original_title, author, author_role, school, category_id,
      read_time, audio_duration, year, rating, readers_count, featured, tagline,
      cover_image, fallback_cover, bgm_theme, studio_audio_url, cover_theme_json, summary, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `);

  const insertChapter = db.prepare(`
    INSERT OR REPLACE INTO chapters (
      id, book_id, chapter_index, chapter_number, title, subtitle, paragraphs_json, reading_time_minutes, audio_url, takeaways_json, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const b of philosophyData.books || []) {
    insertBook.run(
      b.id,
      b.title,
      b.originalTitle || '',
      b.author,
      b.authorRole || '',
      b.school || '',
      b.category || '',
      b.readTime || '60 phút',
      b.audioDuration || '2 giờ',
      b.year || '',
      b.rating || 5.0,
      b.readersCount || '10,000+',
      b.featured ? 1 : 0,
      b.tagline || '',
      b.coverImage || '',
      b.fallbackCover || '',
      b.bgmTheme || '',
      b.studioAudioUrl || '',
      JSON.stringify(b.coverTheme || {}),
      b.summary || ''
    );

    // Xác định nguồn chapters: ưu tiên full chapters nạp từ file chuyên biệt
    let chapters = b.chapters || [];
    if (b.id === 'suy-tuong' && sandbox.window.SUY_TUONG_FULL_CHAPTERS) {
      chapters = sandbox.window.SUY_TUONG_FULL_CHAPTERS;
    } else if (b.id === 'dao-duc-kinh' && sandbox.window.DAO_DUC_KINH_FULL_CHAPTERS) {
      chapters = sandbox.window.DAO_DUC_KINH_FULL_CHAPTERS;
    } else if (b.id === 'cong-hoa' && sandbox.window.CONG_HOA_FULL_CHAPTERS) {
      chapters = sandbox.window.CONG_HOA_FULL_CHAPTERS;
    } else if (b.id === 'zarathustra' && sandbox.window.ZARATHUSTRA_FULL_CHAPTERS) {
      chapters = sandbox.window.ZARATHUSTRA_FULL_CHAPTERS;
    } else if (b.id === 'ban-ve-tu-do' && sandbox.window.BAN_VE_TU_DO_FULL_CHAPTERS) {
      chapters = sandbox.window.BAN_VE_TU_DO_FULL_CHAPTERS;
    }

    let cIndex = 1;
    for (const c of chapters) {
      const rawId = c.id || `chap-${cIndex}`;
      const chapId = rawId.startsWith(`${b.id}-`) ? rawId : `${b.id}-${rawId}`;
      insertChapter.run(
        chapId,
        b.id,
        cIndex++,
        c.number || `Chương ${cIndex}`,
        c.title || `Chương ${cIndex}`,
        c.subtitle || '',
        JSON.stringify(c.paragraphs || []),
        c.readingTimeMinutes || Math.max(3, Math.ceil((c.paragraphs || []).join(' ').length / 800)),
        c.audioUrl || '',
        JSON.stringify(c.takeaways || [])
      );
    }
  }

  // 4. Nạp Quotes
  const insertQuote = db.prepare(`
    INSERT INTO quotes (quote, author, school, context, book_id, is_daily, shares_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  let quoteIdx = 0;
  for (const q of philosophyData.dailyQuotes || []) {
    insertQuote.run(
      q.quote,
      q.author,
      q.school || '',
      q.context || '',
      q.bookId || (q.author.includes('Aurelius') ? 'suy-tuong' : q.author.includes('Lão') ? 'dao-duc-kinh' : null),
      quoteIdx === 0 ? 1 : 0,
      Math.floor(Math.random() * 250) + 50
    );
    quoteIdx++;
  }

  // 5. Nạp mock Reading Logs để Dashboard có số liệu trực quan ngay
  const insertLog = db.prepare(`
    INSERT INTO reading_logs (book_id, chapter_id, duration_seconds, scroll_depth, device, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', ?))
  `);
  const sampleBooks = ['suy-tuong', 'dao-duc-kinh', 'cong-hoa', 'zarathustra', 'ban-ve-tu-do'];
  for (let i = 0; i < 60; i++) {
    const bk = sampleBooks[i % sampleBooks.length];
    const dur = Math.floor(Math.random() * 1200) + 180;
    const scroll = Math.floor(Math.random() * 40) + 60;
    const daysAgo = `-${Math.floor(i / 8)} days`;
    insertLog.run(bk, `${bk}-c1`, dur, scroll, i % 3 === 0 ? 'mobile' : 'desktop', daysAgo);
  }

  // 6. Nạp mock AI Questions Heatmap
  const insertAI = db.prepare(`
    INSERT INTO ai_conversations (book_id, question, response, created_at)
    VALUES (?, ?, ?, datetime('now', ?))
  `);
  const aiSamples = [
    { b: 'suy-tuong', q: 'Làm thế nào để áp dụng nguyên lý Kiểm soát của Khắc Kỷ khi gặp áp lực công việc?', r: 'Tập trung vào hành vi và sự nỗ lực của chính bạn, chấp nhận kết quả bên ngoài.' },
    { b: 'suy-tuong', q: 'Amor Fati - yêu định mệnh có đồng nghĩa với việc cam chịu thất bại không?', r: 'Không, Amor Fati là lòng dũng cảm biến nghịch cảnh thành chất liệu rèn giũa bản lĩnh.' },
    { b: 'dao-duc-kinh', q: 'Ý nghĩa triết học của khái niệm "Vô vi" trong quản trị hiện đại?', r: 'Lãnh đạo bằng việc tạo môi trường và phát huy nội lực thay vì can thiệp vi mô độc đoán.' },
    { b: 'cong-hoa', q: 'Dụ ngôn Hang động giải thích gì về định kiến xã hội?', r: 'Ánh sáng tượng trưng cho chân lý khách quan, người ra khỏi hang có sứ mệnh quay lại khai sáng.' },
    { b: 'zarathustra', q: 'Ý chí quyền lực của Nietzsche khác gì sự ham muốn quyền lực chính trị thông thường?', r: 'Đó là ý chí vượt lên chính bản thân mình (Self-overcoming) để vươn tới sự hoàn thiện tối thượng.' }
  ];
  for (let i = 0; i < aiSamples.length; i++) {
    const s = aiSamples[i];
    insertAI.run(s.b, s.q, s.r, `-${i * 2} hours`);
  }

  console.log('✅ Đã nạp thành công toàn bộ cơ sở dữ liệu SQLite ban đầu (Toàn văn các chương & sách)!');
}

// Chạy khởi tạo ngay khi import
initSchema();
seedInitialDataIfEmpty();

/**
 * =========================================================================
 * BỘ HÀM TRUY VẤN VÀ CẬP NHẬT DỮ LIỆU (DATABASE SERVICE API)
 * =========================================================================
 */

/**
 * 1. Lấy dữ liệu tổng quan cho Dashboard
 */
function getOverviewStats() {
  const booksCount = db.prepare('SELECT COUNT(*) as total FROM books').get().total;
  const chaptersCount = db.prepare('SELECT COUNT(*) as total FROM chapters').get().total;
  const quotesCount = db.prepare('SELECT COUNT(*) as total FROM quotes').get().total;
  const sharesTotal = db.prepare('SELECT COALESCE(SUM(shares_count), 0) as total FROM quotes').get().total;
  
  // Tính tổng giờ đọc sâu từ reading_logs
  const readSecondsRow = db.prepare('SELECT COALESCE(SUM(duration_seconds), 0) as total FROM reading_logs').get();
  const totalReadHours = (readSecondsRow.total / 3600).toFixed(1);

  // Thống kê sách đọc nhiều nhất
  const topBooks = db.prepare(`
    SELECT b.id, b.title, b.author, b.school, b.cover_image,
           COUNT(l.id) as sessions_count,
           COALESCE(SUM(l.duration_seconds), 0) as total_seconds
    FROM books b
    LEFT JOIN reading_logs l ON b.id = l.book_id
    GROUP BY b.id
    ORDER BY total_seconds DESC
    LIMIT 5
  `).all();

  // Thống kê phân bố trường phái
  const schoolDistribution = db.prepare(`
    SELECT c.name, COUNT(b.id) as book_count
    FROM categories c
    LEFT JOIN books b ON c.id = b.category_id
    GROUP BY c.id
  `).all();

  // Danh ngôn của ngày hiện tại
  const dailyQuote = db.prepare('SELECT * FROM quotes WHERE is_daily = 1 LIMIT 1').get() ||
                     db.prepare('SELECT * FROM quotes ORDER BY id DESC LIMIT 1').get();

  // 5 Hoạt động tương tác AI gần nhất
  const recentAiQuestions = db.prepare(`
    SELECT q.id, q.book_id, q.question, q.created_at, b.title as book_title
    FROM ai_conversations q
    LEFT JOIN books b ON q.book_id = b.id
    ORDER BY q.id DESC
    LIMIT 5
  `).all();

  // Sức khỏe database
  const dbHealth = getDbHealth();

  return {
    kpis: {
      totalBooks: booksCount,
      totalChapters: chaptersCount,
      totalQuotes: quotesCount,
      totalShares: sharesTotal,
      deepReadingHours: totalReadHours,
      activeReaders: "68,400+"
    },
    topBooks,
    schoolDistribution,
    dailyQuote,
    recentAiQuestions,
    dbHealth
  };
}

function formatBookRow(book) {
  if (!book) return null;
  book.category = book.category_id || book.category || 'stoicism';
  book.readTime = book.read_time || book.readTime || '60 phút';
  book.audioDuration = book.audio_duration || book.audioDuration || '2 giờ';
  book.originalTitle = book.original_title || book.originalTitle || '';
  book.authorRole = book.author_role || book.authorRole || '';
  book.readersCount = book.readers_count || book.readersCount || '0';
  book.coverImage = book.cover_image || book.coverImage || 'assets/covers/suy-tuong.svg';
  book.fallbackCover = book.fallback_cover || book.fallbackCover || '';
  book.bgmTheme = book.bgm_theme || book.bgmTheme || '';
  book.studioAudioUrl = book.studio_audio_url || book.studioAudioUrl || '';
  return book;
}

/**
 * 2. Quản lý Sách (Books CRUD)
 */
function getAllBooks(categoryId = null) {
  let query = `
    SELECT b.*, (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id) as chapters_count 
    FROM books b
  `;
  let rows;
  if (categoryId && categoryId !== 'all') {
    query += ' WHERE b.category_id = ? ORDER BY b.created_at DESC';
    rows = db.prepare(query).all(categoryId);
  } else {
    query += ' ORDER BY b.created_at DESC';
    rows = db.prepare(query).all();
  }
  return rows.map(formatBookRow);
}

function getBookById(id) {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!book) return null;
  book.chapters = db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_index ASC').all(id);
  // Parse JSON fields
  for (const chap of book.chapters) {
    try { chap.paragraphs = JSON.parse(chap.paragraphs_json); } catch(e) { chap.paragraphs = []; }
    try { chap.takeaways = JSON.parse(chap.takeaways_json); } catch(e) { chap.takeaways = []; }
    chap.number = chap.number || chap.chapter_number || `Chương ${chap.chapter_index || 1}`;
  }
  try { book.coverTheme = JSON.parse(book.cover_theme_json); } catch(e) { book.coverTheme = {}; }
  return formatBookRow(book);
}

function createBook(book) {
  const insert = db.prepare(`
    INSERT INTO books (
      id, title, original_title, author, author_role, school, category_id,
      read_time, audio_duration, year, rating, readers_count, featured, tagline,
      cover_image, fallback_cover, bgm_theme, studio_audio_url, cover_theme_json, summary, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insert.run(
    book.id,
    book.title,
    book.original_title || book.originalTitle || '',
    book.author,
    book.author_role || book.authorRole || '',
    book.school || '',
    book.category_id || book.category || 'stoicism',
    book.read_time || book.readTime || '60 phút',
    book.audio_duration || book.audioDuration || '2 giờ',
    book.year || '',
    book.rating || 5.0,
    book.readers_count || book.readersCount || '0',
    book.featured ? 1 : 0,
    book.tagline || '',
    book.cover_image || book.coverImage || 'assets/covers/suy-tuong.svg',
    book.fallback_cover || book.fallbackCover || '',
    book.bgm_theme || book.bgmTheme || '',
    book.studio_audio_url || book.studioAudioUrl || '',
    typeof book.coverTheme === 'object' ? JSON.stringify(book.coverTheme) : (book.cover_theme_json || '{}'),
    book.summary || '',
    book.status || 'published'
  );
  return getBookById(book.id);
}

function updateBook(id, book) {
  const fields = [];
  const values = [];

  const map = {
    title: book.title,
    original_title: book.original_title ?? book.originalTitle,
    author: book.author,
    school: book.school,
    category_id: book.category_id ?? book.category,
    read_time: book.read_time ?? book.readTime,
    audio_duration: book.audio_duration ?? book.audioDuration,
    tagline: book.tagline,
    summary: book.summary,
    bgm_theme: book.bgm_theme ?? book.bgmTheme,
    studio_audio_url: book.studio_audio_url ?? book.studioAudioUrl,
    cover_image: book.cover_image ?? book.coverImage,
    featured: book.featured !== undefined ? (book.featured ? 1 : 0) : undefined,
    status: book.status
  };

  for (const [key, val] of Object.entries(map)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }
  return getBookById(id);
}

function deleteBook(id) {
  db.prepare('DELETE FROM books WHERE id = ?').run(id);
  return { success: true, id };
}

/**
 * 3. Quản lý Chương (Chapters CRUD)
 */
function getChaptersByBook(bookId) {
  const rows = db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_index ASC').all(bookId);
  return rows.map(r => {
    try { r.paragraphs = JSON.parse(r.paragraphs_json); } catch(e) { r.paragraphs = []; }
    try { r.takeaways = JSON.parse(r.takeaways_json); } catch(e) { r.takeaways = []; }
    r.number = r.number || r.chapter_number || `Chương ${r.chapter_index || 1}`;
    return r;
  });
}

function createReadingLog(log) {
  const insert = db.prepare(`
    INSERT INTO reading_logs (book_id, chapter_id, duration_seconds, scroll_depth, device)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = insert.run(
    log.book_id || 'suy-tuong',
    log.chapter_id || null,
    log.duration_seconds || 60,
    log.scroll_depth || 50,
    log.device || 'desktop'
  );
  return { id: info.lastInsertRowid, ...log };
}

function createChapter(chap) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE book_id = ?').get(chap.book_id);
  const nextIndex = (countRow ? countRow.count : 0) + 1;
  const chapId = chap.id || `${chap.book_id}-chap-${Date.now()}`;
  
  const insert = db.prepare(`
    INSERT INTO chapters (
      id, book_id, chapter_index, chapter_number, title, subtitle,
      paragraphs_json, reading_time_minutes, audio_url, takeaways_json, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    chapId,
    chap.book_id,
    chap.chapter_index || nextIndex,
    chap.chapter_number || `Chương ${nextIndex}`,
    chap.title || `Tiêu đề chương ${nextIndex}`,
    chap.subtitle || '',
    typeof chap.paragraphs === 'object' ? JSON.stringify(chap.paragraphs) : (chap.paragraphs_json || '[]'),
    chap.reading_time_minutes || 5,
    chap.audio_url || '',
    typeof chap.takeaways === 'object' ? JSON.stringify(chap.takeaways) : (chap.takeaways_json || '[]'),
    chap.is_published !== undefined ? (chap.is_published ? 1 : 0) : 1
  );
  return chapId;
}

function getChapterById(id) {
  const row = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);
  if (!row) return null;
  try { row.paragraphs = JSON.parse(row.paragraphs_json); } catch(e) { row.paragraphs = []; }
  try { row.takeaways = JSON.parse(row.takeaways_json); } catch(e) { row.takeaways = []; }
  row.number = row.number || row.chapter_number || `Chương ${row.chapter_index || 1}`;
  row.content = (row.paragraphs || []).join('\n\n');
  return row;
}

function updateChapter(id, chap) {
  const fields = [];
  const values = [];

  if (chap.chapter_number !== undefined) {
    fields.push('chapter_number = ?');
    values.push(chap.chapter_number);
  }
  if (chap.title !== undefined) {
    fields.push('title = ?');
    values.push(chap.title);
  }
  if (chap.subtitle !== undefined) {
    fields.push('subtitle = ?');
    values.push(chap.subtitle);
  }
  if (chap.paragraphs !== undefined) {
    fields.push('paragraphs_json = ?');
    values.push(typeof chap.paragraphs === 'object' ? JSON.stringify(chap.paragraphs) : chap.paragraphs);
  }
  if (chap.reading_time_minutes !== undefined) {
    fields.push('reading_time_minutes = ?');
    values.push(chap.reading_time_minutes);
  }
  if (chap.audio_url !== undefined) {
    fields.push('audio_url = ?');
    values.push(chap.audio_url);
  }
  if (chap.takeaways !== undefined) {
    fields.push('takeaways_json = ?');
    values.push(typeof chap.takeaways === 'object' ? JSON.stringify(chap.takeaways) : chap.takeaways);
  }
  if (chap.is_published !== undefined) {
    fields.push('is_published = ?');
    values.push(chap.is_published ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE chapters SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }
  return getChapterById(id);
}

function deleteChapter(id) {
  db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
  return { success: true, id };
}

function smartIngestChapters(bookId, rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Nội dung văn bản không hợp lệ');
  }

  // Chia theo tiêu đề chương: Chương X:, Quyển X:, Chapter X:...
  const chapterRegex = /(?:^|\n)(?:Chương|Quyển|Hồi|Chapter|Phần)\s*([0-9IVXLCDMivxlcdm]+|[A-Za-z0-9\s]+)[:\.\-\—\–]?\s*([^\n]*)/gi;
  let matches = [];
  let match;
  while ((match = chapterRegex.exec(rawText)) !== null) {
    matches.push({
      index: match.index,
      fullTitle: match[0].trim(),
      numberStr: match[1].trim(),
      titleStr: match[2].trim()
    });
  }

  const parsedChapters = [];
  const currentCount = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE book_id = ?').get(bookId).count;

  if (matches.length === 0) {
    // Không tìm thấy tiêu đề chương cụ thể, coi toàn bộ là 1 chương mới
    const paras = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    parsedChapters.push({
      chapter_number: `Chương ${currentCount + 1}`,
      title: `Tiết mục mới ${currentCount + 1}`,
      paragraphs: paras,
      takeaways: [
        { title: "Đúc Kết Trọng Tâm", desc: "Nghiền ngẫm luận điểm cốt lõi và vận dụng vào thói quen hàng ngày." },
        { title: "Kiểm Soát Nhận Thức", desc: "Giữ tâm trí tĩnh lặng trước các phán xét chủ quan bên ngoài." },
        { title: "Hành Động Nhất Quán", desc: "Thực hành bài học một cách kiên trì thay vì chỉ dừng lại ở lý thuyết." }
      ]
    });
  } else {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const startPos = current.index + current.fullTitle.length;
      const endPos = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;
      const contentChunk = rawText.substring(startPos, endPos).trim();
      
      const paras = contentChunk.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      const chapNumber = isNaN(current.numberStr) ? current.numberStr : `Chương ${current.numberStr}`;
      const chapTitle = current.titleStr || `Chương ${i + 1}`;

      parsedChapters.push({
        chapter_number: chapNumber,
        title: chapTitle,
        paragraphs: paras.length > 0 ? paras : [contentChunk],
        takeaways: [
          { title: "Chiêm Nghiệm Thực Tiễn", desc: `Áp dụng tư tưởng của ${chapTitle} vào công việc và ứng xử.` },
          { title: "Rèn Luyện Bản Lĩnh", desc: "Thực hành việc tự vấn nội tâm và phân định điều trong tầm kiểm soát." },
          { title: "Lan Tỏa Tri Thức", desc: "Chia sẻ góc nhìn sâu sắc này cho bạn bè hoặc ghi chép lại nhật ký." }
        ]
      });
    }
  }

  // Lưu từng chương vào database
  let inserted = [];
  let chapIdx = currentCount + 1;
  for (const item of parsedChapters) {
    const chapId = `${bookId}-chap-${Date.now()}-${chapIdx}`;
    createChapter({
      id: chapId,
      book_id: bookId,
      chapter_index: chapIdx,
      chapter_number: item.chapter_number,
      title: item.title,
      subtitle: '',
      paragraphs: item.paragraphs,
      reading_time_minutes: Math.max(3, Math.ceil(item.paragraphs.join(' ').length / 800)),
      takeaways: item.takeaways,
      is_published: 1
    });
    inserted.push(chapId);
    chapIdx++;
  }

  return {
    success: true,
    totalParsed: parsedChapters.length,
    insertedIds: inserted
  };
}

/**
 * 4. Quản lý Danh ngôn (Quotes)
 */
function getAllQuotes() {
  const rows = db.prepare('SELECT * FROM quotes ORDER BY is_daily DESC, id DESC').all();
  return rows.map(r => ({
    ...r,
    share_count: r.shares_count
  }));
}

function setDailyQuote(quoteId) {
  db.exec('UPDATE quotes SET is_daily = 0');
  db.prepare('UPDATE quotes SET is_daily = 1 WHERE id = ?').run(quoteId);
  const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId);
  if (row) row.share_count = row.shares_count;
  return row;
}

function createQuote(q) {
  if (q.is_daily) {
    db.exec('UPDATE quotes SET is_daily = 0');
  }
  const insert = db.prepare(`
    INSERT INTO quotes (quote, author, school, context, book_id, is_daily, shares_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = insert.run(
    q.quote,
    q.author,
    q.school || '',
    q.context || '',
    q.book_id || null,
    q.is_daily ? 1 : 0,
    0
  );
  return { id: result.lastInsertRowid, share_count: 0, ...q };
}

function incrementQuoteShare(quoteId) {
  db.prepare('UPDATE quotes SET shares_count = shares_count + 1 WHERE id = ?').run(quoteId);
  const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId);
  if (row) row.share_count = row.shares_count;
  return row;
}

function getQuoteById(id) {
  return db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
}

function updateQuote(id, q) {
  const fields = [];
  const values = [];

  if (q.quote !== undefined) { fields.push('quote = ?'); values.push(q.quote); }
  if (q.author !== undefined) { fields.push('author = ?'); values.push(q.author); }
  if (q.school !== undefined) { fields.push('school = ?'); values.push(q.school); }
  if (q.context !== undefined) { fields.push('context = ?'); values.push(q.context); }
  if (q.book_id !== undefined) { fields.push('book_id = ?'); values.push(q.book_id || null); }
  if (q.is_daily !== undefined) {
    if (q.is_daily) db.exec('UPDATE quotes SET is_daily = 0');
    fields.push('is_daily = ?');
    values.push(q.is_daily ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }
  return getQuoteById(id);
}

function deleteQuote(id) {
  db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
  return { success: true, id };
}

/**
 * 5. Quản lý Đàm đạo AI Socrates (AI Conversations Hub)
 */
function getAllAiConversations(bookId = null) {
  if (bookId && bookId !== 'all') {
    return db.prepare(`
      SELECT q.*, b.title as book_title, b.author as book_author, b.cover_image
      FROM ai_conversations q
      LEFT JOIN books b ON q.book_id = b.id
      WHERE q.book_id = ?
      ORDER BY q.id DESC
    `).all(bookId);
  }
  return db.prepare(`
    SELECT q.*, b.title as book_title, b.author as book_author, b.cover_image
    FROM ai_conversations q
    LEFT JOIN books b ON q.book_id = b.id
    ORDER BY q.id DESC
  `).all();
}

function sanitizeXss(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/onerror\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/onload\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

function createAiConversation(conv) {
  const sanitizedQuestion = sanitizeXss(conv.question || '');
  const sanitizedResponse = sanitizeXss(conv.response || '');
  const insert = db.prepare(`
    INSERT INTO ai_conversations (book_id, question, response, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  const res = insert.run(conv.book_id || null, sanitizedQuestion, sanitizedResponse);
  return { id: res.lastInsertRowid, ...conv, question: sanitizedQuestion, response: sanitizedResponse };
}

function deleteAiConversation(id) {
  db.prepare('DELETE FROM ai_conversations WHERE id = ?').run(id);
  return { success: true, id };
}

function clearAiConversations(bookId = null) {
  if (bookId && bookId !== 'all') {
    db.prepare('DELETE FROM ai_conversations WHERE book_id = ?').run(bookId);
  } else {
    db.exec('DELETE FROM ai_conversations');
  }
  return { success: true };
}

function getAiHubStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM ai_conversations').get().count;
  const topBookRow = db.prepare(`
    SELECT b.title, COUNT(q.id) as count
    FROM ai_conversations q
    JOIN books b ON q.book_id = b.id
    GROUP BY q.book_id
    ORDER BY count DESC
    LIMIT 1
  `).get();
  
  return {
    totalConversations: total,
    topBook: topBookRow ? topBookRow.title : 'Suy Tưởng',
    topBookCount: topBookRow ? topBookRow.count : 0,
    satisfactionRate: '98.5%',
    avgLatency: '820ms'
  };
}

/**
 * 6. Quản lý Bậc Thầy Triết Học & Dòng Thời Gian (Philosophers & Masters Timeline)
 */
function getAllPhilosophers() {
  return db.prepare(`
    SELECT p.*, b.title as book_title, b.author as book_author, b.cover_image as book_cover
    FROM philosophers p
    LEFT JOIN books b ON p.book_id = b.id
    ORDER BY p.rowid ASC
  `).all();
}

function getPhilosopherById(id) {
  return db.prepare(`
    SELECT p.*, b.title as book_title, b.author as book_author, b.cover_image as book_cover
    FROM philosophers p
    LEFT JOIN books b ON p.book_id = b.id
    WHERE p.id = ?
  `).get(id);
}

function createPhilosopher(p) {
  const insert = db.prepare(`
    INSERT INTO philosophers (
      id, name, title, era, school, avatar, fallback_avatar, quote, bio, book_id, color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    p.id,
    p.name,
    p.title || '',
    p.era || '',
    p.school || '',
    p.avatar || '',
    p.fallback_avatar || p.fallbackAvatar || '',
    p.quote || '',
    p.bio || '',
    p.book_id || p.bookId || null,
    p.color || 'from-emerald-950 to-stone-900'
  );
  return getPhilosopherById(p.id);
}

function updatePhilosopher(id, p) {
  const fields = [];
  const values = [];

  const map = {
    name: p.name,
    title: p.title,
    era: p.era,
    school: p.school,
    avatar: p.avatar,
    fallback_avatar: p.fallback_avatar ?? p.fallbackAvatar,
    quote: p.quote,
    bio: p.bio,
    book_id: p.book_id !== undefined ? (p.book_id || null) : (p.bookId !== undefined ? (p.bookId || null) : undefined),
    color: p.color
  };

  for (const [key, val] of Object.entries(map)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE philosophers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }
  return getPhilosopherById(id);
}

function deletePhilosopher(id) {
  db.prepare('DELETE FROM philosophers WHERE id = ?').run(id);
  return { success: true, id };
}

function getPhilosophersStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM philosophers').get().count;
  const schools = db.prepare('SELECT COUNT(DISTINCT school) as count FROM philosophers').get().count;
  const linkedBooks = db.prepare('SELECT COUNT(DISTINCT book_id) as count FROM philosophers WHERE book_id IS NOT NULL').get().count;
  return {
    totalPhilosophers: total,
    totalSchools: schools,
    linkedBooksCount: linkedBooks,
    eraSpan: '2600 năm (TCN — Hiện Đại)'
  };
}

/**
 * 7. Sức khỏe cơ sở dữ liệu & Sao lưu (Health & Backup)
 */
function getDbHealth() {
  let fileSizeKb = 0;
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    fileSizeKb = (stats.size / 1024).toFixed(1);
  }
  const tableCounts = {
    books: db.prepare('SELECT COUNT(*) as count FROM books').get().count,
    chapters: db.prepare('SELECT COUNT(*) as count FROM chapters').get().count,
    quotes: db.prepare('SELECT COUNT(*) as count FROM quotes').get().count,
    categories: db.prepare('SELECT COUNT(*) as count FROM categories').get().count,
    philosophers: db.prepare('SELECT COUNT(*) as count FROM philosophers').get().count,
    readingLogs: db.prepare('SELECT COUNT(*) as count FROM reading_logs').get().count,
    aiConversations: db.prepare('SELECT COUNT(*) as count FROM ai_conversations').get().count,
  };

  return {
    status: 'online',
    engine: 'SQLite (Node.js Native DatabaseSync)',
    dbPath: DB_PATH,
    sizeKb: fileSizeKb,
    tables: tableCounts,
    timestamp: new Date().toISOString()
  };
}

function backupDatabase() {
  const backupDir = path.join(DATA_DIR, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `sophia-backup-${dateStr}.db`);
  fs.copyFileSync(DB_PATH, backupFile);
  return {
    success: true,
    backupFile,
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  db,
  getOverviewStats,
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getChaptersByBook,
  createChapter,
  getChapterById,
  updateChapter,
  deleteChapter,
  smartIngestChapters,
  getAllQuotes,
  getQuoteById,
  setDailyQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  incrementQuoteShare,
  getAllAiConversations,
  createAiConversation,
  deleteAiConversation,
  clearAiConversations,
  getAiHubStats,
  getAllPhilosophers,
  getPhilosopherById,
  createPhilosopher,
  updatePhilosopher,
  deletePhilosopher,
  getPhilosophersStats,
  getDbHealth,
  backupDatabase,
  reseedDatabase,
  createReadingLog
};
