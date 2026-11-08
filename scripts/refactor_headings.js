const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Danh sách các H3 là tiêu đề khu vực lớn cần chuyển thành H2
const targetTitles = [
  'Tủ Sách Kinh Điển Toàn Văn',
  'Những Bậc Thầy Triết Học',
  'Vì Sao Nên Đọc Minh Triết Tại Đây?',
  'Đối Thoại Socrates AI — Vấn Đáp & Phản Tư Triết Học',
  'Góc Nhìn Minh Triết Trong Thời Đại Số'
];

targetTitles.forEach(title => {
  // Tìm khối <h3 ...> ... title ... </h3>
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('(<h)3([^>]*>([\\s\\S]*?' + escaped + '[\\s\\S]*?)<\\/h)3>', 'g');
  const matches = html.match(regex);
  if (matches) {
    console.log('Found & converting H3 to H2 for:', title);
    html = html.replace(regex, '$12$22>');
  } else {
    console.log('Not matched for:', title);
  }
});

fs.writeFileSync('index.html', html, 'utf8');

const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];
console.log('\n--- KẾT QUẢ CẬP NHẬT HEADING ---');
console.log('Tổng số H2:', h2Matches.length);
console.log('Tổng số H3:', h3Matches.length);
h2Matches.forEach((h, i) => console.log(`  H2[${i}]:`, h.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')));
