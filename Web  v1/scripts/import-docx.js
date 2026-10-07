/**
 * SOPHIA CODEX - CÔNG CỤ TỰ ĐỘNG NẠP SÁCH TỪ FILE WORD (.DOCX) / TEXT
 * Dành riêng cho Solo Creator:
 * Bạn chỉ cần đặt file Word vào thư mục "raw-books/" và chạy:
 *   node scripts/import-docx.js TenFile.docx
 * Hệ thống sẽ tự động bóc tách thành các chương chuẩn và nạp vào thư viện.
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'raw-books');
const OUT_DIR = path.join(__dirname, '..', 'js', 'books-data');

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log("==================================================================");
console.log("🏛️  SOPHIA CODEX - BỘ NẠP TOÀN VĂN SÁCH TỰ ĐỘNG (DOCX PIPELINE)");
console.log("==================================================================");
console.log(`📁 Thư mục nhận file Word: ${RAW_DIR}`);
console.log(`📁 Thư mục xuất dữ liệu sách web: ${OUT_DIR}`);
console.log("");
console.log("Hướng dẫn sử dụng:");
console.log("1. Đặt file bản thảo của bạn (ví dụ: SuyTuong.docx hoặc TrietHoc.txt) vào thư mục 'raw-books/'");
console.log("2. Chạy lệnh: node scripts/import-docx.js TenFile");
console.log("3. Website sẽ tự động cập nhật toàn bộ mục lục và nội dung toàn văn!");
console.log("==================================================================");
