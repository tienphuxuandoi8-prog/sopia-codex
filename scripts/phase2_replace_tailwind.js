const fs = require('fs');
const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

// Regex loại bỏ Tailwind CDN và inline tailwind.config
const tailwindCdnRegex = /<!-- Tailwind CSS CDN -->[\s\S]*?<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>[\s\S]*?tailwind\.config\s*=\s*\{[\s\S]*?\n\s*\}[\s\S]*?<\/script>/;

const staticTailwindLink = `<!-- Pre-compiled Static Tailwind CSS (High Performance) -->
  <link rel="stylesheet" href="css/tailwind.min.css">`;

if (tailwindCdnRegex.test(html)) {
  html = html.replace(tailwindCdnRegex, staticTailwindLink);
  fs.writeFileSync(path, html, 'utf8');
  console.log('✅ Đã loại bỏ Tailwind Play CDN và thay thế bằng css/tailwind.min.css thành công!');
} else {
  console.log('⚠️ Không tìm thấy regex Tailwind CDN trong index.html');
}
