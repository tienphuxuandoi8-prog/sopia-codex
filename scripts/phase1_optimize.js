const fs = require('fs');
const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Tối ưu Google Fonts
const oldFontRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Be\+Vietnam\+Pro:[^"]+" rel="stylesheet">/;
const newFont = '<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">';

if (oldFontRegex.test(html)) {
  html = html.replace(oldFontRegex, newFont);
  console.log('✅ 1. Google Fonts đã được tinh gọn (Be Vietnam Pro + Playfair Display)');
} else {
  console.log('⚠️ Không tìm thấy regex Google Fonts');
}

// 2. Trì hoãn Google Analytics (gtag.js)
const oldGaRegex = /<!-- Google tag \(gtag\.js\) - Google Analytics 4 -->[\s\S]*?gtag\('config',\s*'G-S9D1Q8DP1L'\);[\s\S]*?<\/script>/;
const newGa = `<!-- Google tag (gtag.js) - Google Analytics 4 (Deferred) -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-S9D1Q8DP1L');

    window.addEventListener('load', function() {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-S9D1Q8DP1L';
      document.head.appendChild(gaScript);
    });
  </script>`;

if (oldGaRegex.test(html)) {
  html = html.replace(oldGaRegex, newGa);
  console.log('✅ 2. Google Analytics đã được chuyển sang chế độ Deferred Load');
} else {
  console.log('⚠️ Không tìm thấy regex GA4');
}

// 3. Thêm defer cho 11 Application Scripts
const oldScriptsRegex = /<!-- Application Scripts -->([\s\S]*?)<!-- PWA Service Worker Registration -->/;
const scriptsMatch = html.match(oldScriptsRegex);
if (scriptsMatch) {
  let scriptsBlock = scriptsMatch[1];
  scriptsBlock = scriptsBlock.replace(/<script src=/g, '<script defer src=');
  html = html.replace(oldScriptsRegex, `<!-- Application Scripts (Deferred for Performance) -->${scriptsBlock}<!-- PWA Service Worker Registration -->`);
  console.log('✅ 3. Đã thêm thuộc tính defer cho toàn bộ 11 file JavaScript');
} else {
  console.log('⚠️ Không tìm thấy block Application Scripts');
}

fs.writeFileSync(path, html, 'utf8');
console.log('🎉 Hoàn thành Phiên 1 thành công!');
