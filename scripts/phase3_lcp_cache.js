const fs = require('fs');

// 1. Tối ưu index.html (Preload Hero LCP cover image & bổ sung width, height, fetchpriority)
const indexPath = 'index.html';
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Thêm link rel="preload" cho ảnh hero LCP
const preloadLink = `  <!-- Preload Critical LCP Asset -->
  <link rel="preload" as="image" href="assets/covers/suy-tuong.svg" type="image/svg+xml" fetchpriority="high">`;

if (!indexHtml.includes('rel="preload" as="image" href="assets/covers/suy-tuong.svg"')) {
  indexHtml = indexHtml.replace('  <!-- Pre-compiled Static Tailwind CSS (High Performance) -->', `${preloadLink}\n  <!-- Pre-compiled Static Tailwind CSS (High Performance) -->`);
  console.log('✅ 1. Đã thêm preload cho LCP cover image (suy-tuong.svg)');
}

// Bổ sung width="224" height="320" fetchpriority="high" cho ảnh hero LCP
const oldHeroImgRegex = /<img src="assets\/covers\/suy-tuong\.svg"\s+alt="Suy Tưởng - Marcus Aurelius \(Bìa Cổ Dát Vàng\)"\s+class="book-art shadow-2xl">/;
const newHeroImg = `<img src="assets/covers/suy-tuong.svg" 
                   alt="Suy Tưởng - Marcus Aurelius (Bìa Cổ Dát Vàng)" 
                   width="224" height="320"
                   fetchpriority="high"
                   class="book-art shadow-2xl">`;

if (oldHeroImgRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldHeroImgRegex, newHeroImg);
  console.log('✅ 2. Đã cập nhật width, height & fetchpriority=high cho Hero LCP img');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');

// 2. Tối ưu vercel.json (Cấu hình cache dài hạn cho static css, js, font)
const vercelPath = 'vercel.json';
let vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

// Rà soát danh sách headers
const staticCacheRules = [
  {
    "source": "/css/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  },
  {
    "source": "/js/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
];

let existingSources = vercelConfig.headers.map(h => h.source);
staticCacheRules.forEach(rule => {
  if (!existingSources.includes(rule.source)) {
    vercelConfig.headers.push(rule);
    console.log(`✅ Đã thêm Cache-Control immutable cho ${rule.source}`);
  }
});

fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8');
console.log('🎉 Hoàn thành Phiên 3 thành công!');
