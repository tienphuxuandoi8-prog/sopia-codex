/**
 * SOPHIA CODEX - AUTOMATED TEST SUITE & E2E VERIFICATION (BƯỚC 6)
 * Kiểm thử tự động toàn diện: HTTP, REST API, SQLite CRUD, Static Assets
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const WEB_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🏛️  SOPHIA CODEX - KIỂM THỬ HỆ THỐNG TOÀN DIỆN (B6)');
  console.log('======================================================\n');

  // 1. KIỂM THỬ HTTP TRANG TĨNH
  console.log('1️⃣  KIỂM THỬ TRANG GIAO DIỆN CHÍNH (HTTP 200 OK)');
  try {
    const resHome = await fetch(`${BASE_URL}/`);
    assert(resHome.status === 200, 'Trang Độc Giả (index.html) trả về HTTP 200');

    const resAdmin = await fetch(`${BASE_URL}/admin.html`);
    assert(resAdmin.status === 200, 'Trang Quản Trị (admin.html) trả về HTTP 200');
  } catch (err) {
    assert(false, `Kết nối máy chủ thất bại: ${err.message}`);
  }

  // 2. KIỂM THỬ TÀI NGUYÊN TĨNH (ASSETS & SCRIPTS)
  console.log('\n2️⃣  KIỂM THỬ TÀI NGUYÊN (ASSETS, CSS, JS TRÊN ĐĨA)');
  const checkFiles = [
    'index.html',
    'admin.html',
    'css/style.css',
    'js/app.js',
    'js/admin.js',
    'js/reader.js',
    'js/audio.js',
    'js/bgm.js',
    'js/ai-chat.js',
    'js/quote-card.js',
    'server/index.js',
    'server/db.js',
    'data/sophia.db'
  ];

  for (const f of checkFiles) {
    const p = path.join(WEB_DIR, f);
    assert(fs.existsSync(p), `Tệp "${f}" tồn tại trên ổ đĩa`);
  }

  // 3. KIỂM THỬ CÁC ENDPOINT REST API (READ ONLY)
  console.log('\n3️⃣  KIỂM THỬ CÁC REST API TRUY VẤN DỮ LIỆU (GET APIS)');
  try {
    // API Overview
    const resOverview = await fetch(`${BASE_URL}/api/overview`);
    const dataOverview = await resOverview.json();
    assert(resOverview.status === 200 && dataOverview.kpis.totalBooks >= 5, 'GET /api/overview - Trả về đủ KPI tủ sách');

    // API Books
    const resBooks = await fetch(`${BASE_URL}/api/books`);
    const books = await resBooks.json();
    assert(resBooks.status === 200 && Array.isArray(books) && books.length >= 5, `GET /api/books - Danh sách ${books.length} tác phẩm`);

    // API Chapters
    const resChaps = await fetch(`${BASE_URL}/api/books/suy-tuong/chapters`);
    const chaps = await resChaps.json();
    assert(resChaps.status === 200 && Array.isArray(chaps) && chaps.length >= 12, `GET /api/books/suy-tuong/chapters - Đủ ${chaps.length} chương toàn văn`);

    // API Quotes
    const resQuotes = await fetch(`${BASE_URL}/api/quotes`);
    const quotes = await resQuotes.json();
    assert(resQuotes.status === 200 && quotes.length >= 4, `GET /api/quotes - Đủ ${quotes.length} danh ngôn kinh điển`);

    // API AI Hub
    const resAiStats = await fetch(`${BASE_URL}/api/ai/stats`);
    const aiStats = await resAiStats.json();
    assert(resAiStats.status === 200 && aiStats.satisfactionRate, 'GET /api/ai/stats - Chỉ số đối thoại Socratic AI');

    const resAiConvs = await fetch(`${BASE_URL}/api/ai/conversations`);
    const aiConvs = await resAiConvs.json();
    assert(resAiConvs.status === 200 && Array.isArray(aiConvs), `GET /api/ai/conversations - Luồng ${aiConvs.length} đàm đạo`);

    // API Philosophers
    const resPhils = await fetch(`${BASE_URL}/api/philosophers`);
    const phils = await resPhils.json();
    assert(resPhils.status === 200 && phils.length >= 5, `GET /api/philosophers - Đủ ${phils.length} bậc thầy triết học`);

    const resPhilStats = await fetch(`${BASE_URL}/api/philosophers/stats`);
    const philStats = await resPhilStats.json();
    assert(resPhilStats.status === 200 && philStats.totalPhilosophers >= 5, 'GET /api/philosophers/stats - Biên niên sử 2600 năm');

    // API DB Health
    const resHealth = await fetch(`${BASE_URL}/api/db/health`);
    const health = await resHealth.json();
    assert(resHealth.status === 200 && health.engine.includes('SQLite'), `GET /api/db/health - Động cơ SQLite (${health.sizeKb} KB)`);
  } catch (err) {
    assert(false, `Lỗi kiểm thử GET APIs: ${err.message}`);
  }

  // 4. KIỂM THỬ CHU TRÌNH GHI VÀ XÓA (CRUD CYCLE)
  console.log('\n4️⃣  KIỂM THỬ CHU TRÌNH GHI - SỬA - XÓA (CRUD CYCLE TEST)');
  try {
    // 4.1 Thử nghiệm tạo đàm đạo AI
    const resCreateAi = await fetch(`${BASE_URL}/api/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id: 'suy-tuong',
        question: 'Câu hỏi kiểm thử tự động',
        response: 'Câu trả lời kiểm thử tự động'
      })
    });
    const createdAi = await resCreateAi.json();
    assert(resCreateAi.status === 201 && createdAi.id, 'POST /api/ai/conversations - Tạo lượt đàm đạo mới thành công');

    if (createdAi.id) {
      const resDelAi = await fetch(`${BASE_URL}/api/ai/conversations/${createdAi.id}`, { method: 'DELETE' });
      assert(resDelAi.status === 200, 'DELETE /api/ai/conversations/:id - Xóa bản ghi kiểm thử an toàn');
    }

    // 4.2 Thử nghiệm tính năng chia sẻ thiệp FB
    const resShare = await fetch(`${BASE_URL}/api/quotes/1/share`, { method: 'POST' });
    assert(resShare.status === 200, 'POST /api/quotes/:id/share - Tăng lượt xuất thiệp Facebook thành công');

    // 4.4 Thử nghiệm ghi nhận Reading Logs vào SQLite
    const resReadLog = await fetch(`${BASE_URL}/api/reading-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: 'suy-tuong', chapter_id: 'suy-tuong-c1', duration_seconds: 120, scroll_depth: 100, device: 'desktop' })
    });
    const logData = await resReadLog.json();
    assert(resReadLog.status === 201 && logData.id, 'POST /api/reading-logs - Ghi nhận nhật ký đọc sâu vào SQLite thành công');

  } catch (err) {
    assert(false, `Lỗi kiểm thử CRUD: ${err.message}`);
  }

  // 5. KIỂM THỬ TRẢI NGHIỆM ĐỘC GIẢ & TYPOGRAPHY (READER EXPERIENCE SUITE)
  console.log('\n5️⃣  KIỂM THỬ TRẢI NGHIỆM ĐỘC GIẢ & TYPOGRAPHY (QA AUDIT)');
  try {
    // 5.1 Kiểm tra đồng bộ dữ liệu chương hồi (không bị undefined)
    const resBook = await fetch(`${BASE_URL}/api/books/suy-tuong`);
    const bookData = await resBook.json();
    const ch0 = bookData.chapters && bookData.chapters[0];
    assert(ch0 && ch0.number && ch0.number !== 'undefined', `Đồng bộ chương hồi SQLite: ${ch0?.number} - "${ch0?.title}"`);

    // 5.2 Kiểm tra tải đủ bộ Font chữ học viện
    const indexHtmlContent = fs.readFileSync(path.join(WEB_DIR, 'index.html'), 'utf8');
    const requiredFonts = ['Be+Vietnam+Pro', 'Cinzel', 'Inter', 'Lora', 'Merriweather', 'Playfair+Display'];
    const allFontsLoaded = requiredFonts.every(font => indexHtmlContent.includes(font));
    assert(allFontsLoaded, 'Tải đủ 6 font học viện trên index.html (Be Vietnam Pro, Cinzel, Inter, Lora, Merriweather, Playfair Display)');

    // 5.3 Kiểm tra khoảng đệm an toàn chống Audio Dock che khuất nội dung
    const styleCssContent = fs.readFileSync(path.join(WEB_DIR, 'css', 'style.css'), 'utf8');
    assert(styleCssContent.includes('#view-reader') && styleCssContent.includes('padding-bottom'), 'CSS có clearance padding-bottom chống thanh Dock che khuất nút cuối trang');

    // 5.4 Kiểm tra logic điều hướng chương an toàn trong reader.js
    const readerJsContent = fs.readFileSync(path.join(WEB_DIR, 'js', 'reader.js'), 'utf8');
    assert(readerJsContent.includes('prevChapter()') && readerJsContent.includes('nextChapter()'), 'Trình đọc có bộ điều hướng prevChapter & nextChapter an toàn');

    // 5.5 Kiểm tra bộ tạo thiệp canvas xử lý ngắt dòng thông minh
    const quoteJsContent = fs.readFileSync(path.join(WEB_DIR, 'js', 'quote-card.js'), 'utf8');
    assert(quoteJsContent.includes("split('\\n')"), 'Canvas Quote Card có logic ngắt dòng đa đoạn thông minh');

  } catch (err) {
    assert(false, `Lỗi kiểm thử Reader Experience: ${err.message}`);
  }

  // TỔNG KẾT KẾT QUẢ
  console.log('\n======================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} BÀI TEST THÀNH CÔNG`);
  if (failedTests === 0) {
    console.log('🎉 TẤT CẢ TÍNH NĂNG ĐỀU HOẠT ĐỘNG HOÀN HẢO 100%!');
  } else {
    console.log(`⚠️ Có ${failedTests} bài test không đạt.`);
  }
  console.log('======================================================\n');
}

runTests();
