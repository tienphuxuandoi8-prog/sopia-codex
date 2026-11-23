const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join('data', 'sophia.db');
const db = new DatabaseSync(dbPath);

console.log('=== 1. UPDATING PILOT 1: nghe-thuat-khac-ky-trong-doi-song-so ===');

const p1 = db.prepare('SELECT id, slug, content FROM blog_posts WHERE slug = ?').get('nghe-thuat-khac-ky-trong-doi-song-so');
if (!p1) {
  console.error('Không tìm thấy bài viết Pilot 1!');
  process.exit(1);
}

// Kiểm tra và chèn thêm liên kết bắc cầu Đông - Tây vào Mục 2 của Pilot 1 nếu chưa có
let p1Content = p1.content;

// 1. Cầu nối Đông - Tây ở cuối Mục 2
const crossSchoolText = `Nghệ thuật làm chủ tâm trí này của chủ nghĩa Khắc kỷ có một điểm tương giao kỳ diệu với minh triết Phương Đông: Sự buông bỏ phán đoán để giữ tâm bất biến trước vạn biến cũng chính là hạt nhân trong [triết lý Vô vi và nghệ thuật sống thuận tự nhiên theo Đạo Đức Kinh](/blog/dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien) của Lão Tử, nơi sự mềm mại uyển chuyển như dòng nước lại có sức mạnh chiến thắng mọi vật cứng mạnh nhất trần gian.`;

if (!p1Content.includes('/blog/dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien')) {
  // Chèn vào cuối Mục 2 trước Mục 3
  const targetSplit = '## 3. Khung Thực Hành Khắc Kỷ 3 Bước Cho Người Dùng Mạng Xã Hội';
  if (p1Content.includes(targetSplit)) {
    p1Content = p1Content.replace(
      targetSplit,
      `${crossSchoolText}\n\n${targetSplit}`
    );
    console.log('✅ Đã bổ sung cầu nối Đông - Tây vào Pilot 1');
  }
}

// Cập nhật lại vào DB
db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(p1Content, p1.id);
console.log('✅ Đã lưu cập nhật Pilot 1');


console.log('\n=== 2. UPDATING PILOT 2: dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien ===');

const p2 = db.prepare('SELECT id, slug, content FROM blog_posts WHERE slug = ?').get('dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien');
if (!p2) {
  console.error('Không tìm thấy bài viết Pilot 2!');
  process.exit(1);
}

let p2Content = p2.content;

// 1. Cầu nối sang Pilot 1 (Khắc kỷ đời sống số) ở cuối Mục 1
const crossStoicText = `Sự bất an kinh niên khi cố gắng cưỡng ép và kiểm soát mọi biến số ngoại cảnh này cũng chính là bài toán trung tâm mà triết học phương Tây tìm cách hóa giải qua [nghệ thuật phân định nhị phân quyền kiểm soát của chủ nghĩa Khắc kỷ trong đời sống số](/blog/nghe-thuat-khac-ky-trong-doi-song-so), nơi con người học cách thu hồi năng lượng tâm trí về với pháo đài bình an nội tại.`;

if (!p2Content.includes('/blog/nghe-thuat-khac-ky-trong-doi-song-so')) {
  const targetSplit2 = '--- \n\n### 2. Giải Mã Bản Chất "Vô Vi"';
  const altSplit2 = '### 2. Giải Mã Bản Chất "Vô Vi"';
  if (p2Content.includes(altSplit2)) {
    p2Content = p2Content.replace(
      altSplit2,
      `${crossStoicText}\n\n---\n\n${altSplit2}`
    );
    console.log('✅ Đã bổ sung cầu nối sang Khắc kỷ Đời Sống Số vào Pilot 2');
  }
}

db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(p2Content, p2.id);
console.log('✅ Đã lưu cập nhật Pilot 2');

console.log('\n=== 3. VERIFYING LINKS IN BOTH PILOT POSTS ===');
const check1 = db.prepare('SELECT content FROM blog_posts WHERE id = ?').get(p1.id);
const links1 = [...check1.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({ text: m[1], url: m[2] })).filter(l => !l.url.startsWith('#'));
console.log('Pilot 1 Links (' + links1.length + '):', links1);

const check2 = db.prepare('SELECT content FROM blog_posts WHERE id = ?').get(p2.id);
const links2 = [...check2.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({ text: m[1], url: m[2] })).filter(l => !l.url.startsWith('#'));
console.log('Pilot 2 Links (' + links2.length + '):', links2);
