const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Danh sách các H3 tiêu đề khu vực lớn cần chuyển sang H2
const h3TargetsToH2 = [
  // 1. Tủ Sách Kinh Điển Toàn Văn
  {
    regex: /<h3 class="font-display font-bold text-base md:text-lg text-stone-900 dark:text-stone-100">\s*Tủ Sách Kinh Điển Toàn Văn\s*<\/h3>/,
    replace: `<h2 class="font-display font-bold text-base md:text-lg text-stone-900 dark:text-stone-100">\n                Tủ Sách Kinh Điển Toàn Văn\n              </h2>`
  },
  // 2. Vì Sao Nên Đọc Minh Triết Tại Đây?
  {
    regex: /<h3 class="font-display font-bold text-xl md:text-2xl text-stone-100">\s*Vì Sao Nên Đọc Minh Triết Tại Đây\?\s*<\/h3>/,
    replace: `<h2 class="font-display font-bold text-xl md:text-2xl text-stone-100">\n              Vì Sao Nên Đọc Minh Triết Tại Đây?\n            </h2>`
  },
  // 3. Đối Thoại Socrates AI — Vấn Đáp & Phản Tư Triết Học
  {
    regex: /<h3 class="text-xl md:text-2xl font-display font-bold text-stone-900 dark:text-stone-100">\s*Đối Thoại Socrates AI — Vấn Đáp & Phản Tư Triết Học\s*<\/h3>/,
    replace: `<h2 class="text-xl md:text-2xl font-display font-bold text-stone-900 dark:text-stone-100">\n                Đối Thoại Socrates AI — Vấn Đáp & Phản Tư Triết Học\n              </h2>`
  },
  // 4. Góc Nhìn Minh Triết Trong Thời Đại Số
  {
    regex: /<h3 class="font-display font-bold text-xl md:text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-2">\s*<i data-lucide="newspaper" class="w-5 h-5 text-amber-600 dark:text-amber-400"><\/i>\s*Góc Nhìn Minh Triết Trong Thời Đại Số\s*<\/h3>/,
    replace: `<h2 class="font-display font-bold text-xl md:text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-2">\n                <i data-lucide="newspaper" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>\n                Góc Nhìn Minh Triết Trong Thời Đại Số\n              </h2>`
  }
];

h3TargetsToH2.forEach((item, i) => {
  if (item.regex.test(html)) {
    html = html.replace(item.regex, item.replace);
    console.log(`Đã chuyển đổi H3 -> H2 mục [${i + 1}] thành công.`);
  } else {
    console.log(`Cảnh báo: Không khớp regex cho mục [${i + 1}]`);
  }
});

fs.writeFileSync('index.html', html, 'utf8');

const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];

console.log('\n=== CẤU TRÚC HEADING SAU KHI CHUẨN HÓA ===');
console.log('Tổng số H1:', h1Matches.length);
console.log('Tổng số H2:', h2Matches.length);
console.log('Tổng số H3:', h3Matches.length);

console.log('\n--- Danh sách H2 ---');
h2Matches.forEach((h, i) => console.log(`H2[${i}]: ${h.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')}`));

console.log('\n--- Danh sách H3 ---');
h3Matches.forEach((h, i) => console.log(`H3[${i}]: ${h.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')}`));
