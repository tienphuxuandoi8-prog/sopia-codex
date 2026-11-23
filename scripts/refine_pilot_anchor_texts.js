const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join('data', 'sophia.db');
const db = new DatabaseSync(dbPath);

console.log('=== 1. TINH CHỈNH PILOT 1: khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius ===');
const p1 = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius');
let c1 = p1.content;

// Rút gọn anchor text dài, giữ nguyên độ mượt mà văn phong
c1 = c1.replace(
  '[Hoàng đế triết gia Marcus Aurelius](/triet-gia/marcus-aurelius)',
  '[Marcus Aurelius](/triet-gia/marcus-aurelius)'
);

c1 = c1.replace(
  'trong trường hợp này, việc [giải mã tình yêu thương thuần khiết và lòng vị tha Khắc kỷ](/blog/marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky) sẽ là liều thuốc giải độc giúp bạn hóa giải mọi ấm ức một cách nhẹ nhàng.',
  'trong trường hợp này, việc thấu hiểu [tình yêu vị tha Khắc kỷ](/blog/marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky) sẽ là liều thuốc giúp bạn hóa giải mọi tổn thương và tìm lại sự bao dung.'
);

c1 = c1.replace(
  'ta sẽ tự nhiên thấu hiểu [triết lý Vô vi trong nghệ thuật buông bỏ gồng ép](/blog/triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo) của Lão Tử — nơi hành động không còn bị ma sát bởi cái tôi cưỡng cầu.',
  'ta sẽ tự nhiên thấu cảm [triết lý Vô vi](/blog/triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo) của Lão Tử về nghệ thuật buông bỏ gồng ép — nơi hành động trôi chảy thuận tự nhiên mà không bị ma sát bởi cái tôi cưỡng cầu.'
);

c1 = c1.replace(
  '[Suy Tưởng (Meditations)](/kinh-dien/suy-tuong)',
  '[Suy Tưởng](/kinh-dien/suy-tuong)'
);

db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c1, p1.id);
console.log('✅ Đã tinh chỉnh Pilot 1 với anchor text ngắn gọn, sang trọng.');


console.log('\n=== 2. TINH CHỈNH PILOT 2: triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo ===');
const p2 = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo');
let c2 = p2.content;

c2 = c2.replace(
  '[Đạo Đức Kinh toàn văn](/kinh-dien/dao-duc-kinh)',
  '[Đạo Đức Kinh](/kinh-dien/dao-duc-kinh)'
);

c2 = c2.replace(
  'Để hiểu trọn vẹn nền tảng này, bạn có thể tham khảo bài viết về [bản chất sống thuận tự nhiên theo Đạo Đức Kinh](/blog/dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien).',
  'Để thấu triệt nền tảng này, bạn có thể đọc thêm bài phân tích về [lối sống thuận tự nhiên](/blog/dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien) trong tư tưởng Đạo gia.'
);

c2 = c2.replace(
  'Khi kết hợp trí tuệ buông bỏ này với [kỹ thuật phân định nhị phân quyền kiểm soát của chủ nghĩa Khắc kỷ](/blog/khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius), bạn sẽ xây dựng được một màng lọc năng lượng bất khả xâm phạm trước mọi biến cố.',
  'Khi kết hợp trí tuệ buông bỏ này với [pháo đài nội tâm Khắc kỷ](/blog/khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius), bạn sẽ xây dựng được một màng lọc năng lượng vững chắc trước mọi biến cố.'
);

db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c2, p2.id);
console.log('✅ Đã tinh chỉnh Pilot 2 với anchor text ngắn gọn, sang trọng.');


console.log('\n=== 3. ĐỒNG BỘ TINH CHỈNH CÁC BÀI VIẾT KHÁC ===');
const p3 = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('nghe-thuat-khac-ky-trong-doi-song-so');
if (p3) {
  let c3 = p3.content;
  c3 = c3.replace(
    '[phương pháp 5 bước thiết lập pháo đài nội tâm trị dứt điểm overthinking](/blog/khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius)',
    '[phương pháp trị overthinking](/blog/khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius)'
  );
  c3 = c3.replace(
    '[triết lý Vô vi và nghệ thuật sống thuận tự nhiên theo Đạo Đức Kinh](/blog/dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien)',
    '[triết lý Vô vi thuận tự nhiên](/blog/dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien)'
  );
  c3 = c3.replace(
    '[nghệ thuật yêu thương tha nhân trong tinh thần Khắc kỷ](/blog/marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky)',
    '[tình yêu tha nhân Khắc kỷ](/blog/marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky)'
  );
  c3 = c3.replace(
    '[Hoàng đế triết gia Marcus Aurelius](/triet-gia/marcus-aurelius)',
    '[Marcus Aurelius](/triet-gia/marcus-aurelius)'
  );
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c3, p3.id);
}

const p4 = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien');
if (p4) {
  let c4 = p4.content;
  c4 = c4.replace(
    '[nghệ thuật phân định nhị phân quyền kiểm soát của chủ nghĩa Khắc kỷ trong đời sống số](/blog/nghe-thuat-khac-ky-trong-doi-song-so)',
    '[Khắc kỷ trong đời sống số](/blog/nghe-thuat-khac-ky-trong-doi-song-so)'
  );
  c4 = c4.replace(
    '[triết lý Vô vi trong quản trị năng lượng cá nhân và nghệ thuật buông bỏ gồng ép](/blog/triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo)',
    '[quản trị năng lượng cá nhân](/blog/triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo)'
  );
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c4, p4.id);
}

console.log('✅ Hoàn tất kiểm toán và tinh chỉnh toàn bộ anchor text.');
