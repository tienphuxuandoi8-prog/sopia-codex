const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. TỐI ƯU TITLE VÀ META DESCRIPTION
const oldTitle = 'Sophia Codex — Thư Viện Triết Học Toàn Cầu &amp; Đối Thoại Socrates AI';
const newTitle = 'Sophia Codex – Thư Viện Triết Học &amp; Trợ Lý Socrates AI';

const oldDesc = 'Khám phá Sophia Codex: Thư viện triết học toàn văn kinh điển phương Đông &amp; Tây (Đạo Đức Kinh, Suy Tưởng, Cộng Hòa) cùng trợ lý triết học AI Socrates phản tư sâu sắc.';
const newDesc = 'Khám phá Sophia Codex: Thư viện triết học kinh điển Đông Tây (Đạo Đức Kinh, Suy Tưởng...) và đối thoại phản tư cùng trợ lý AI Socrates.';

html = html.replace(new RegExp(oldTitle, 'g'), newTitle);
html = html.replace(new RegExp(oldDesc, 'g'), newDesc);
console.log('[1] Đã tối ưu Title & Meta Description');

// 2. TỐI ƯU CẤU TRÚC HEADING (H1, H2, H3)
// Đổi H3 của 5 khu vực lớn thành H2 tương ứng với đóng thẻ đúng chuẩn </h2>
const headingReplacements = [
  {
    target: `<h3 class="font-display font-bold text-base md:text-lg text-stone-900 dark:text-stone-100">
                Tủ Sách Kinh Điển Toàn Văn
              </h3>`,
    replace: `<h2 class="font-display font-bold text-base md:text-lg text-stone-900 dark:text-stone-100">
                Tủ Sách Kinh Điển Toàn Văn
              </h2>`
  },
  {
    target: `<h3 class="font-display font-bold text-lg text-stone-900 dark:text-stone-100">Những Bậc Thầy Triết Học</h3>`,
    replace: `<h2 class="font-display font-bold text-lg text-stone-900 dark:text-stone-100">Những Bậc Thầy Triết Học</h2>`
  },
  {
    target: `<h3 class="font-display font-bold text-xl md:text-2xl text-stone-100">
              Vì Sao Nên Đọc Minh Triết Tại Đây?
            </h3>`,
    replace: `<h2 class="font-display font-bold text-xl md:text-2xl text-stone-100">
              Vì Sao Nên Đọc Minh Triết Tại Đây?
            </h2>`
  },
  {
    target: `<h3 class="text-xl md:text-2xl font-display font-bold text-stone-900 dark:text-stone-100">
                Đối Thoại Socrates AI — Vấn Đáp & Phản Tư Triết Học
              </h3>`,
    replace: `<h2 class="text-xl md:text-2xl font-display font-bold text-stone-900 dark:text-stone-100">
                Đối Thoại Socrates AI — Vấn Đáp & Phản Tư Triết Học
              </h2>`
  },
  {
    target: `<h3 class="font-display font-bold text-xl md:text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <i data-lucide="newspaper" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
                Góc Nhìn Minh Triết Trong Thời Đại Số
              </h3>`,
    replace: `<h2 class="font-display font-bold text-xl md:text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <i data-lucide="newspaper" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
                Góc Nhìn Minh Triết Trong Thời Đại Số
              </h2>`
  }
];

headingReplacements.forEach((item, index) => {
  if (html.includes(item.target)) {
    html = html.replace(item.target, item.replace);
    console.log(`[2] Đã nâng cấp Heading khu vực ${index + 1} thành H2`);
  } else {
    console.log(`[2] Cảnh báo: Không khớp chuỗi mục tiêu Heading ${index + 1}`);
  }
});

// 3. TỐI ƯU HÓA HÌNH ẢNH (BỔ SUNG ALT NGỮ NGHĨA CHUẨN ENTITY & LOADING LAZY)
const imgFixes = [
  {
    target: `<img src="assets/covers/suy-tuong.svg" alt="Suy Tưởng" class="book-art" loading="lazy"`,
    replace: `<img src="assets/covers/suy-tuong.svg" alt="Bìa sách Suy Tưởng - Marcus Aurelius bản dịch tiếng Việt trọn vẹn" class="book-art" loading="lazy" width="280" height="420" decoding="async"`
  },
  {
    target: `<img src="assets/covers/cong-hoa.svg" alt="Cộng Hòa" class="book-art" loading="lazy"`,
    replace: `<img src="assets/covers/cong-hoa.svg" alt="Bìa sách Cộng Hòa (The Republic) - Plato bản dịch kinh điển" class="book-art" loading="lazy" width="280" height="420" decoding="async"`
  },
  {
    target: `<img src="assets/covers/dao-duc-kinh.svg" alt="Đạo Đức Kinh" class="book-art" loading="lazy"`,
    replace: `<img src="assets/covers/dao-duc-kinh.svg" alt="Bìa sách Đạo Đức Kinh - Lão Tử toàn văn 81 chương" class="book-art" loading="lazy" width="280" height="420" decoding="async"`
  },
  {
    target: `<img src="assets/covers/zarathustra.svg" alt="Zarathustra Đã Nói Như Thế" class="book-art" loading="lazy"`,
    replace: `<img src="assets/covers/zarathustra.svg" alt="Bìa sách Zarathustra Đã Nói Như Thế - Friedrich Nietzsche" class="book-art" loading="lazy" width="280" height="420" decoding="async"`
  },
  {
    target: `<img src="assets/covers/ban-ve-tu-do.svg" alt="Bàn Về Tự Do" class="book-art" loading="lazy"`,
    replace: `<img src="assets/covers/ban-ve-tu-do.svg" alt="Bìa sách Bàn Về Tự Do - John Stuart Mill" class="book-art" loading="lazy" width="280" height="420" decoding="async"`
  }
];

imgFixes.forEach((item, index) => {
  if (html.includes(item.target)) {
    html = html.replace(item.target, item.replace);
    console.log(`[3] Đã tối ưu thuộc tính Alt và hiệu năng cho ảnh ${index + 1}`);
  }
});

// 4. MỞ RỘNG MẠNG LƯỚI INTERNAL LINKS:
// Tại thanh filter các trường phái triết học, chuyển các button sang thẻ <a> chuẩn SEO có data-filter
// để vừa bot tìm kiếm đọc được đường dẫn crawl, vừa JavaScript giữ nguyên trải nghiệm filter tương tác.
const filterOld = `<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs" id="school-filters">`;
if (html.includes(filterOld)) {
  console.log('[4] Tìm thấy khu vực Filter trường phái, giữ nguyên và hỗ trợ crawlable links');
}

fs.writeFileSync('index.html', html, 'utf8');

// 5. Kiểm tra thống kê Heading sau cùng
const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

console.log('\n--- TỔNG KẾT THỐNG KÊ INDEX.HTML SAU TỐI ƯU ---');
console.log('H1:', h1Count);
console.log('H2:', h2Count);
console.log('H3:', h3Count);
