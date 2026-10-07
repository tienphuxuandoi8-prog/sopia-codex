/**
 * SOPHIA CODEX - ADMIN STUDIO E2E TEST SUITE
 * Kiểm thử toàn diện 8 Phân Hệ Nghiệp Vụ Cốt Lõi của Trang Quản Trị Studio:
 * 1. Overview Dashboard (KPIs, Giờ đọc, Trường phái, Socrates stream, DB status)
 * 2. Book Studio (5 Tác phẩm, Lọc trường phái, Cập nhật trường phái tùy biến)
 * 3. Chapter Studio (99 Chương, Bóc tách thông minh, Chiêm nghiệm thực tiễn)
 * 4. Quotes Studio (Kho danh ngôn, Độc quyền 1 câu Daily Quote, Xuất thiệp FB)
 * 5. Socrates AI Hub (Lưu đối thoại, Lọc theo sách, Dọn dẹp lịch sử đàm đạo)
 * 6. Philosophers Studio (Biên niên sử 2600 năm, Liên kết và Hủy liên kết tác phẩm)
 * 7. Audio Studio & BGM (Sóng âm, Cấu hình URL phòng thu & Khôi phục AI TTS)
 * 8. DB Health & 1-Click Backup (7 Bảng dữ liệu SQLite, Dung lượng KB, Tệp sao lưu)
 * 9. Reader Data Contract Compatibility (Tương thích 100% với Reader Frontend)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
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

async function runAdminTests() {
  console.log('\n================================================================');
  console.log('🏛️  SOPHIA CODEX - KIỂM THỬ TRANG QUẢN TRỊ STUDIO (ADMIN E2E)');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // PHÂN HỆ 1: OVERVIEW DASHBOARD
    // -------------------------------------------------------------
    console.log('1️⃣  PHÂN HỆ TỔNG QUAN (OVERVIEW DASHBOARD):');
    const resOverview = await fetch(`${BASE_URL}/api/overview`);
    assert(resOverview.ok, 'GET /api/overview trả về HTTP 200');
    const overviewData = await resOverview.json();

    assert(overviewData.kpis && typeof overviewData.kpis.totalBooks === 'number', 'KPIs: totalBooks là số nguyên hợp lệ');
    assert(overviewData.kpis.totalChapters >= 99, `KPIs: totalChapters đạt ít nhất 99 chương (thực tế: ${overviewData.kpis.totalChapters})`);
    assert(overviewData.kpis.deepReadingHours !== undefined, 'KPIs: deepReadingHours được thống kê');
    assert(overviewData.kpis.activeReaders === "68,400+", 'KPIs: activeReaders đạt mốc 68,400+ độc giả');

    assert(Array.isArray(overviewData.topBooks) && overviewData.topBooks.length > 0, 'Top tác phẩm có dữ liệu phiên đọc');
    assert(Array.isArray(overviewData.schoolDistribution) && overviewData.schoolDistribution.length >= 5, 'Phân bổ đủ 5 trường phái triết học cốt lõi');
    assert(overviewData.dailyQuote && overviewData.dailyQuote.quote, 'Danh ngôn hôm nay (Daily Quote) hợp lệ');
    assert(overviewData.dbHealth && overviewData.dbHealth.status === 'online', 'Trạng thái cơ sở dữ liệu SQLite: Online');

    // -------------------------------------------------------------
    // PHÂN HỆ 2: BOOK STUDIO & TỦ SÁCH TOÀN VĂN
    // -------------------------------------------------------------
    console.log('\n2️⃣  PHÂN HỆ TỦ SÁCH (BOOK STUDIO):');
    const resBooks = await fetch(`${BASE_URL}/api/books`);
    assert(resBooks.ok, 'GET /api/books trả về HTTP 200');
    const books = await resBooks.json();
    assert(Array.isArray(books) && books.length >= 5, `Tủ sách có ít nhất 5 kiệt tác (thực tế: ${books.length})`);

    const suyTuong = books.find(b => b.id === 'suy-tuong');
    assert(!!suyTuong, 'Tác phẩm "Suy Tưởng" của Marcus Aurelius tồn tại');

    // Test Cập nhật trường phái tùy biến (Custom school name)
    const updateRes = await fetch(`${BASE_URL}/api/books/suy-tuong`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        school: 'Chủ nghĩa Khắc Kỷ La Mã'
      })
    });
    assert(updateRes.ok, 'PUT /api/books/suy-tuong cập nhật trường phái thành công');

    const checkBookRes = await fetch(`${BASE_URL}/api/books/suy-tuong`);
    const updatedSuyTuong = await checkBookRes.json();
    assert(updatedSuyTuong.school === 'Chủ nghĩa Khắc Kỷ La Mã', 'Trường phái sách đã lưu chuẩn vào SQLite');

    // -------------------------------------------------------------
    // PHÂN HỆ 3: SOẠN THẢO CHƯƠNG (CHAPTER STUDIO)
    // -------------------------------------------------------------
    console.log('\n3️⃣  PHÂN HỆ SOẠN THẢO CHƯƠNG (CHAPTER STUDIO):');
    const resChapters = await fetch(`${BASE_URL}/api/books/suy-tuong/chapters`);
    assert(resChapters.ok, 'GET /api/books/suy-tuong/chapters trả về HTTP 200');
    const chapters = await resChapters.json();
    assert(Array.isArray(chapters) && chapters.length > 0, `Danh sách chương của Suy Tưởng có ${chapters.length} chương`);

    const firstChapter = chapters[0];
    const resChapDetail = await fetch(`${BASE_URL}/api/chapters/${firstChapter.id}`);
    assert(resChapDetail.ok, `GET /api/chapters/${firstChapter.id} trả về HTTP 200`);
    const chapDetail = await resChapDetail.json();
    assert(chapDetail.number !== undefined, 'Dữ liệu chương có trường "number"');
    assert(Array.isArray(chapDetail.takeaways), 'Dữ liệu chương có mảng "takeaways" (3 chiêm nghiệm thực tiễn)');
    assert(typeof chapDetail.content === 'string' && chapDetail.content.length > 50, 'Nội dung toàn văn chương phong phú và đầy đủ');

    // -------------------------------------------------------------
    // PHÂN HỆ 4: KHO DANH NGÔN & THIỆP FB (QUOTES STUDIO)
    // -------------------------------------------------------------
    console.log('\n4️⃣  PHÂN HỆ KHO DANH NGÔN & THIỆP FB (QUOTES STUDIO):');
    const resQuotes = await fetch(`${BASE_URL}/api/quotes`);
    assert(resQuotes.ok, 'GET /api/quotes trả về HTTP 200');
    const quotes = await resQuotes.json();
    assert(Array.isArray(quotes) && quotes.length >= 4, `Kho danh ngôn có ít nhất 4 trích dẫn (thực tế: ${quotes.length})`);

    // Test Singleton Daily Quote Constraint
    const dailyQuotes = quotes.filter(q => q.is_daily === 1 || q.is_daily === true);
    assert(dailyQuotes.length === 1, `Chỉ có DUY NHẤT 1 danh ngôn được đặt làm Daily Quote (thực tế: ${dailyQuotes.length})`);

    // Test Đổi Daily Quote sang câu khác và xác nhận câu cũ bị tắt
    const targetQuote = quotes.find(q => q.id !== dailyQuotes[0].id);
    if (targetQuote) {
      const setDailyRes = await fetch(`${BASE_URL}/api/quotes/${targetQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_daily: 1 })
      });
      assert(setDailyRes.ok, `Đặt câu #${targetQuote.id} làm Daily Quote thành công`);

      const resQuotesAfter = await fetch(`${BASE_URL}/api/quotes`);
      const quotesAfter = await resQuotesAfter.json();
      const newDailies = quotesAfter.filter(q => q.is_daily === 1 || q.is_daily === true);
      assert(newDailies.length === 1 && newDailies[0].id === targetQuote.id, 'Tính duy nhất (Singleton) của Daily Quote được đảm bảo 100%');
    }

    // Test Tăng lượt chia sẻ thiệp FB
    const quoteToShare = quotes[0];
    const initialShares = quoteToShare.share_count || 0;
    const shareRes = await fetch(`${BASE_URL}/api/quotes/${quoteToShare.id}/share`, { method: 'POST' });
    assert(shareRes.ok, 'POST /api/quotes/:id/share tăng lượt xuất thiệp FB thành công');
    const shareData = await shareRes.json();
    assert(shareData.share_count === initialShares + 1, `Số lượt chia sẻ tăng từ ${initialShares} lên ${shareData.share_count}`);

    // -------------------------------------------------------------
    // PHÂN HỆ 5: SOCRATES AI HUB (HIỀN TRIẾT ĐÀM ĐẠO)
    // -------------------------------------------------------------
    console.log('\n5️⃣  PHÂN HỆ HIỀN TRIẾT AI HUB:');
    // Test Tạo câu hỏi mới trong AI Playground
    const askRes = await fetch(`${BASE_URL}/api/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id: 'suy-tuong',
        question: 'Làm thế nào để tìm thấy bình an nội tâm khi công việc gặp bế tắc?',
        response: 'Marcus Aurelius khuyên rằng hãy tập trung vào những gì nằm trong tầm kiểm soát của bạn.'
      })
    });
    assert(askRes.ok, 'POST /api/ai/conversations ghi nhận phiên đàm đạo vào SQLite');
    const askData = await askRes.json();
    assert(askData.id !== undefined, 'Bản ghi đối thoại AI nhận ID hợp lệ');

    // Test Lọc theo sách
    const resFilteredAi = await fetch(`${BASE_URL}/api/ai/conversations?book_id=suy-tuong`);
    assert(resFilteredAi.ok, 'GET /api/ai/conversations?book_id=suy-tuong trả về HTTP 200');
    const filteredAi = await resFilteredAi.json();
    assert(Array.isArray(filteredAi) && filteredAi.some(c => c.id === askData.id), 'Bản ghi mới xuất hiện trong danh sách lọc theo sách');

    // Test Xóa lịch sử đàm đạo theo sách (Clean AI History)
    const delAiRes = await fetch(`${BASE_URL}/api/ai/conversations?book_id=suy-tuong`, { method: 'DELETE' });
    assert(delAiRes.ok, 'DELETE /api/ai/conversations?book_id=suy-tuong dọn dẹp lịch sử theo sách thành công');

    const resAiAfterDel = await fetch(`${BASE_URL}/api/ai/conversations?book_id=suy-tuong`);
    const aiAfterDel = await resAiAfterDel.json();
    assert(Array.isArray(aiAfterDel) && aiAfterDel.length === 0, 'Lịch sử đàm đạo của Suy Tưởng đã được dọn sạch');

    // -------------------------------------------------------------
    // PHÂN HỆ 6: BẬC THẦY TƯ TƯỞNG & DÒNG THỜI GIAN (PHILOSOPHERS STUDIO)
    // -------------------------------------------------------------
    console.log('\n6️⃣  PHÂN HỆ BẬC THẦY & DÒNG THỜI GIAN (PHILOSOPHERS STUDIO):');
    const resPhils = await fetch(`${BASE_URL}/api/philosophers`);
    assert(resPhils.ok, 'GET /api/philosophers trả về HTTP 200');
    const phils = await resPhils.json();
    assert(Array.isArray(phils) && phils.length >= 5, `Danh sách Bậc Thầy có ít nhất 5 triết gia (thực tế: ${phils.length})`);

    const marcus = phils.find(p => p.id === 'marcus-aurelius');
    assert(!!marcus, 'Triết gia Marcus Aurelius có mặt trong biên niên sử');

    // Test Bug Fix: Hủy liên kết tác phẩm (Unlink Book by setting book_id: null)
    const unlinkRes = await fetch(`${BASE_URL}/api/philosophers/marcus-aurelius`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: null })
    });
    assert(unlinkRes.ok, 'PUT /api/philosophers/:id với book_id: null thực hiện thành công');

    const checkPhilRes = await fetch(`${BASE_URL}/api/philosophers/marcus-aurelius`);
    const updatedMarcus = await checkPhilRes.json();
    assert(updatedMarcus.book_id === null, 'Tác phẩm đã được hủy liên kết chuẩn xác (book_id is null in SQLite)');

    // Phục hồi lại liên kết sách cho Marcus Aurelius
    await fetch(`${BASE_URL}/api/philosophers/marcus-aurelius`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: 'suy-tuong' })
    });
    console.log('  ℹ️  Đã khôi phục liên kết tác phẩm cho Marcus Aurelius');

    // -------------------------------------------------------------
    // PHÂN HỆ 7: STUDIO ÂM THANH & BGM CONSOLE
    // -------------------------------------------------------------
    console.log('\n7️⃣  PHÂN HỆ STUDIO ÂM THANH & BGM CONSOLE:');
    // Test Cập nhật URL âm thanh phòng thu
    const audioUrlTest = 'https://stream.sophia-codex.org/audio/suy-tuong-master.mp3';
    const putAudioRes = await fetch(`${BASE_URL}/api/books/suy-tuong`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studio_audio_url: audioUrlTest,
        bgm_theme: 'rain',
        audio_duration: '3 giờ 15 phút'
      })
    });
    assert(putAudioRes.ok, 'PUT /api/books/suy-tuong cấu hình URL âm thanh phòng thu thành công');

    const bookAudioCheck = await (await fetch(`${BASE_URL}/api/books/suy-tuong`)).json();
    assert(bookAudioCheck.studio_audio_url === audioUrlTest, 'URL âm thanh phòng thu đã lưu vào SQLite');
    assert(bookAudioCheck.bgm_theme === 'rain', 'BGM Theme "rain" đã lưu vào SQLite');

    // Test Bug Fix: Xóa URL âm thanh về rỗng để khôi phục giọng đọc AI TTS
    const clearAudioRes = await fetch(`${BASE_URL}/api/books/suy-tuong`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studio_audio_url: '' })
    });
    assert(clearAudioRes.ok, 'PUT /api/books/suy-tuong xóa studio_audio_url thành rỗng thành công');

    const bookAudioCleared = await (await fetch(`${BASE_URL}/api/books/suy-tuong`)).json();
    assert(bookAudioCleared.studio_audio_url === '', 'studio_audio_url rỗng được lưu (đáp ứng chuyển sang AI TTS)');

    // -------------------------------------------------------------
    // PHÂN HỆ 8: SỨC KHỎE CSDL SQLITE & SAO LƯU 1-CLICK
    // -------------------------------------------------------------
    console.log('\n8️⃣  PHÂN HỆ SỨC KHỎE CSDL SQLITE & SAO LƯU (DB HEALTH & BACKUP):');
    const resHealth = await fetch(`${BASE_URL}/api/db/health`);
    assert(resHealth.ok, 'GET /api/db/health trả về HTTP 200');
    const health = await resHealth.json();

    assert(health.status === 'online', 'Trạng thái SQLite: online');
    assert(health.engine && health.engine.includes('SQLite'), `Động cơ: ${health.engine}`);
    assert(parseFloat(health.sizeKb) > 50, `Dung lượng CSDL: ${health.sizeKb} KB (> 50 KB)`);
    assert(health.tables && typeof health.tables.books === 'number', 'Bảng books có số bản ghi');
    assert(typeof health.tables.chapters === 'number', 'Bảng chapters có số bản ghi');
    assert(typeof health.tables.quotes === 'number', 'Bảng quotes có số bản ghi');
    assert(typeof health.tables.categories === 'number', 'Bảng categories có số bản ghi');
    assert(typeof health.tables.philosophers === 'number', 'Bảng philosophers có số bản ghi');
    assert(typeof health.tables.readingLogs === 'number', 'Bảng readingLogs có số bản ghi');
    assert(typeof health.tables.aiConversations === 'number', 'Bảng aiConversations có số bản ghi');

    // Test 1-Click Backup API
    const resBackup = await fetch(`${BASE_URL}/api/db/backup`, { method: 'POST' });
    assert(resBackup.ok, 'POST /api/db/backup trả về HTTP 200');
    const backupData = await resBackup.json();
    assert(backupData.success === true, 'Sao lưu SQLite 1-Click thành công');
    assert(fs.existsSync(backupData.backupFile), `Tệp sao lưu vật lý thực sự tồn tại trên ổ đĩa: ${path.basename(backupData.backupFile)}`);

    // -------------------------------------------------------------
    // PHÂN HỆ 9: TƯƠNG THÍCH ĐỘC GIẢ (READER DATA CONTRACT)
    // -------------------------------------------------------------
    console.log('\n9️⃣  KIỂM THỬ TƯƠNG THÍCH CONTRACT DỮ LIỆU ĐỘC GIẢ (READER FRONTEND):');
    const resReaderBooks = await fetch(`${BASE_URL}/api/books`);
    const readerBooks = await resReaderBooks.json();
    const sample = readerBooks[0];

    assert(sample.category !== undefined, 'Trường camelCase "category" tồn tại cho js/app.js');
    assert(sample.coverImage !== undefined, 'Trường camelCase "coverImage" tồn tại cho bìa sách');
    assert(sample.readTime !== undefined, 'Trường camelCase "readTime" tồn tại cho thời gian đọc');
    assert(sample.originalTitle !== undefined, 'Trường camelCase "originalTitle" tồn tại');
    assert(sample.audioDuration !== undefined, 'Trường camelCase "audioDuration" tồn tại');

    // TỔNG KẾT
    console.log('\n================================================================');
    console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ STUDIO:`);
    console.log(`   Tổng số ca kiểm thử: ${totalTests}`);
    console.log(`   Thành công (PASS):   ${passedTests}`);
    console.log(`   Thất bại (FAIL):     ${failedTests}`);
    console.log('================================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Lỗi ngoại lệ trong quá trình chạy test:', err);
    process.exit(1);
  }
}

runAdminTests();
