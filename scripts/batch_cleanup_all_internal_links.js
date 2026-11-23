const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join('data', 'sophia.db');
const db = new DatabaseSync(dbPath);

console.log('=== BẮT ĐẦU CHUẨN HÓA TOÀN BỘ 8 BÀI VIẾT THEO SKILL SOPHIA-INTERNAL-LINK ===\n');

// 1. an-du-hang-dong-plato-thuc-tai-hay-ao-anh-thuat-toan
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('an-du-hang-dong-plato-thuc-tai-hay-ao-anh-thuat-toan');
  let c = p.content;
  // Rút gọn anchor text
  c = c.replace(
    '[nguyên lý gây hại của John Stuart Mill về ranh giới tự do cá nhân trong kỷ nguyên số](/blog/nguyen-ly-gay-hai-john-stuart-mill-ranh-gioi-tu-do-ca-nhan)',
    '[nguyên lý gây hại](/blog/nguyen-ly-gay-hai-john-stuart-mill-ranh-gioi-tu-do-ca-nhan)'
  );
  c = c.replace(
    '[triết gia Socrates và người môn trò xuất sắc Plato](/triet-gia/socrates)',
    '[Socrates và Plato](/triet-gia/socrates)'
  );
  // Khử trùng lặp link /kinh-dien/cong-hoa (giữ lần 1, lần 2 chuyển thành text thuần túy)
  // Lần 1: trong thân bài. Lần 2: ở trích dẫn cuối.
  const firstIdx = c.indexOf('(/kinh-dien/cong-hoa)');
  if (firstIdx !== -1) {
    const secondIdx = c.indexOf('(/kinh-dien/cong-hoa)', firstIdx + 1);
    if (secondIdx !== -1) {
      c = c.substring(0, secondIdx - 23) + 'Cộng Hòa' + c.substring(secondIdx + 21);
    }
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: an-du-hang-dong-plato-thuc-tai-hay-ao-anh-thuat-toan');
}

// 2. y-chi-hung-cuong-amor-fati-nietzsche-nghe-thuat-yeu-nghich-canh
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('y-chi-hung-cuong-amor-fati-nietzsche-nghe-thuat-yeu-nghich-canh');
  let c = p.content;
  c = c.replace(
    '[nhà tư tưởng hiện sinh Friedrich Nietzsche](/triet-gia/nietzsche)',
    '[Friedrich Nietzsche](/triet-gia/nietzsche)'
  );
  c = c.replace(
    '[Marcus Aurelius tiếp cận số phận bằng sự an tĩnh nội tại và lòng thấu cảm vị tha](/blog/marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky)',
    '[lòng vị tha Khắc kỷ](/blog/marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky)'
  );
  // Khử trùng lặp link /kinh-dien/zarathustra
  const firstIdx = c.indexOf('(/kinh-dien/zarathustra)');
  if (firstIdx !== -1) {
    const secondIdx = c.indexOf('(/kinh-dien/zarathustra)', firstIdx + 1);
    if (secondIdx !== -1) {
      c = c.substring(0, secondIdx - 27) + 'Zarathustra Đã Nói Như Thế' + c.substring(secondIdx + 24);
    }
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: y-chi-hung-cuong-amor-fati-nietzsche-nghe-thuat-yeu-nghich-canh');
}

// 3. nguyen-ly-gay-hai-john-stuart-mill-ranh-gioi-tu-do-ca-nhan
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('nguyen-ly-gay-hai-john-stuart-mill-ranh-gioi-tu-do-ca-nhan');
  let c = p.content;
  c = c.replace(
    '[nhà tư tưởng thời kỳ Khai Sáng John Stuart Mill](/triet-gia/john-stuart-mill)',
    '[John Stuart Mill](/triet-gia/john-stuart-mill)'
  );
  c = c.replace(
    '[chiếc hang tối trong ẩn dụ bất hủ của Plato](/blog/an-du-hang-dong-plato-thuc-tai-hay-ao-anh-thuat-toan)',
    '[ẩn dụ hang động Plato](/blog/an-du-hang-dong-plato-thuc-tai-hay-ao-anh-thuat-toan)'
  );
  // Khử trùng lặp link /kinh-dien/ban-ve-tu-do
  const firstIdx = c.indexOf('(/kinh-dien/ban-ve-tu-do)');
  if (firstIdx !== -1) {
    const secondIdx = c.indexOf('(/kinh-dien/ban-ve-tu-do)', firstIdx + 1);
    if (secondIdx !== -1) {
      c = c.substring(0, secondIdx - 25) + 'Bàn Về Tự Do' + c.substring(secondIdx + 25);
    }
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: nguyen-ly-gay-hai-john-stuart-mill-ranh-gioi-tu-do-ca-nhan');
}

// 4. marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky');
  let c = p.content;
  c = c.replace(
    '[Hoàng đế triết gia Marcus Aurelius](/triet-gia/marcus-aurelius)',
    '[Marcus Aurelius](/triet-gia/marcus-aurelius)'
  );
  c = c.replace(
    '[bảo vệ pháo đài nội tâm trước những áp lực của thời đại số](/blog/nghe-thuat-khac-ky-trong-doi-song-so)',
    '[Khắc kỷ trong đời sống số](/blog/nghe-thuat-khac-ky-trong-doi-song-so)'
  );
  c = c.replace(
    '[triết lý Amor Fati và ý chí hùng cường của Friedrich Nietzsche](/blog/y-chi-hung-cuong-amor-fati-nietzsche-nghe-thuat-yeu-nghich-canh)',
    '[triết lý Amor Fati](/blog/y-chi-hung-cuong-amor-fati-nietzsche-nghe-thuat-yeu-nghich-canh)'
  );
  c = c.replace(
    '[thiết lập pháo đài nội tâm kiên cố để chấm dứt tình trạng overthinking](/blog/khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius)',
    '[phương pháp trị overthinking](/blog/khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius)'
  );
  // Khử trùng lặp link /kinh-dien/suy-tuong (giữ 1 link đầu, 2 link sau chuyển thành chữ thường)
  while (c.split('(/kinh-dien/suy-tuong)').length > 2) {
    const lastIdx = c.lastIndexOf('(/kinh-dien/suy-tuong)');
    const bracketStart = c.lastIndexOf('[', lastIdx);
    const bracketEnd = c.indexOf(']', bracketStart);
    const text = c.substring(bracketStart + 1, bracketEnd);
    c = c.substring(0, bracketStart) + text + c.substring(lastIdx + 22);
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky');
}

// 5. nghe-thuat-khac-ky-trong-doi-song-so
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('nghe-thuat-khac-ky-trong-doi-song-so');
  let c = p.content;
  // Khử trùng lặp link /kinh-dien/suy-tuong
  while (c.split('(/kinh-dien/suy-tuong)').length > 2) {
    const lastIdx = c.lastIndexOf('(/kinh-dien/suy-tuong)');
    const bracketStart = c.lastIndexOf('[', lastIdx);
    const bracketEnd = c.indexOf(']', bracketStart);
    const text = c.substring(bracketStart + 1, bracketEnd);
    c = c.substring(0, bracketStart) + text + c.substring(lastIdx + 22);
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: nghe-thuat-khac-ky-trong-doi-song-so');
}

// 6. dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien');
  let c = p.content;
  // Khử trùng lặp link /kinh-dien/dao-duc-kinh
  while (c.split('(/kinh-dien/dao-duc-kinh)').length > 2) {
    const lastIdx = c.lastIndexOf('(/kinh-dien/dao-duc-kinh)');
    const bracketStart = c.lastIndexOf('[', lastIdx);
    const bracketEnd = c.indexOf(']', bracketStart);
    const text = c.substring(bracketStart + 1, bracketEnd);
    c = c.substring(0, bracketStart) + text + c.substring(lastIdx + 25);
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien');
}

// 7. khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius');
  let c = p.content;
  // Khử trùng lặp link /kinh-dien/suy-tuong
  while (c.split('(/kinh-dien/suy-tuong)').length > 2) {
    const lastIdx = c.lastIndexOf('(/kinh-dien/suy-tuong)');
    const bracketStart = c.lastIndexOf('[', lastIdx);
    const bracketEnd = c.indexOf(']', bracketStart);
    const text = c.substring(bracketStart + 1, bracketEnd);
    c = c.substring(0, bracketStart) + text + c.substring(lastIdx + 22);
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius');
}

// 8. triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo
{
  const p = db.prepare('SELECT id, content FROM blog_posts WHERE slug = ?').get('triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo');
  let c = p.content;
  // Khử trùng lặp link /kinh-dien/dao-duc-kinh
  while (c.split('(/kinh-dien/dao-duc-kinh)').length > 2) {
    const lastIdx = c.lastIndexOf('(/kinh-dien/dao-duc-kinh)');
    const bracketStart = c.lastIndexOf('[', lastIdx);
    const bracketEnd = c.indexOf(']', bracketStart);
    const text = c.substring(bracketStart + 1, bracketEnd);
    c = c.substring(0, bracketStart) + text + c.substring(lastIdx + 25);
  }
  db.prepare('UPDATE blog_posts SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(c, p.id);
  console.log('✅ Đã chuẩn hóa: triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo');
}

// Checkpoint SQLite WAL
db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
console.log('\n✅ Đã thực hiện wal_checkpoint(TRUNCATE) thành công!');
