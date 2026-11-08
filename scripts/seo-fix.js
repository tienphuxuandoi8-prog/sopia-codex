const fs = require('fs');

function updateHtml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update Title
  content = content.replace(/<title>[\s\S]*?<\/title>/, '<title>Sophia Codex – Thư Viện Triết Học Số &amp; Sách Kinh Điển</title>');

  // 2. Add Favicons & Hreflang right after title if not present
  const metaAdditions = `  <!-- Favicon & Icons Chuẩn W3C & SERP -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/favicon.svg">

  <!-- Hreflang & Ngôn ngữ -->
  <link rel="alternate" hreflang="vi" href="https://vusitien.click/">
  <link rel="alternate" hreflang="x-default" href="https://vusitien.click/">`;

  if (!content.includes('rel="icon"')) {
    content = content.replace(/(<title>[\s\S]*?<\/title>)/, `$1\n\n${metaAdditions}`);
  }

  // 3. Update Meta Description
  content = content.replace(/<meta\s+name="description"\s+content="[\s\S]*?">/, '<meta name="description" content="Khám phá kho tàng triết học cổ điển, bản dịch trọn vẹn tác phẩm Suy Tưởng, Lão Tử và thư viện Audio Studio AI tại Sophia Codex. Đọc ngay!">');

  // 4. Update Canonical
  content = content.replace(/<link\s+rel="canonical"\s+href="[\s\S]*?">/, '<link rel="canonical" href="https://vusitien.click/">');

  // 5. Update OG Title & URL
  content = content.replace(/<meta\s+property="og:title"\s+content="[\s\S]*?">/, '<meta property="og:title" content="Sophia Codex – Thư Viện Triết Học Số &amp; Sách Kinh Điển">');
  content = content.replace(/<meta\s+property="og:url"\s+content="[\s\S]*?">/, '<meta property="og:url" content="https://vusitien.click/">');

  // 6. Update Twitter Title
  content = content.replace(/<meta\s+name="twitter:title"\s+content="[\s\S]*?">/, '<meta name="twitter:title" content="Sophia Codex – Thư Viện Triết Học Số &amp; Sách Kinh Điển">');

  // 7. Ensure Single clean H1
  // Add a visually hidden or semantic H1 for overall website title if spotlight is H1, or adjust hierarchy
  // Look at current H1
  // In index.html:
  // <h1 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-stone-100 leading-tight">
  //   Suy Tưởng (Meditations)
  // </h1>
  // Having the book title as H1 while the site is Sophia Codex causes SEOquake to flag "Needs Review" because heading structure hierarchy is ambiguous.
  // We can prefix an accessible site H1 or wrap:
  if (!content.includes('id="main-site-h1"')) {
    content = content.replace(/(<main[^>]*>)/, `$1\n        <!-- Main Site Heading for SEO & Accessibility -->\n        <h1 id="main-site-h1" class="sr-only">Sophia Codex – Thư Viện Triết Học Số Toàn Văn &amp; Trợ Lý Socrates AI</h1>`);
    // Then turn the book title from H1 to H2 with spotlight indicator
    content = content.replace(/<h1 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-stone-100 leading-tight">([\s\S]*?)<\/h1>/, '<h2 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-stone-100 leading-tight">$1</h2>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated:', filePath);
}

updateHtml('public/index.html');
updateHtml('index.html');
