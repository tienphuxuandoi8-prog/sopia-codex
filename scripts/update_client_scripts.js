const fs = require('fs');

// 1. UPDATE READER.JS
const readerFiles = [
  'js/reader.js',
  'js/pages/reader.js',
  'public/js/reader.js',
  'public/js/pages/reader.js'
];

readerFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace bookUrl creation and pushState in updateDynamicBookSEO
  code = code.replace(
    'const bookUrl = `https://vusitien.click/?book=${encodeURIComponent(book.id || book.slug)}`;',
    'const bookSlug = encodeURIComponent(book.id || book.slug);\n      const bookUrl = `https://www.vusitien.click/kinh-dien/${bookSlug}`;'
  );

  code = code.replace(
    '`https://vusitien.click/${book.coverImage.replace(/^\\//, \'\')}`',
    '`https://www.vusitien.click/${book.coverImage.replace(/^\\//, \'\')}`'
  );

  code = code.replace(
    `const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('book', book.id || book.slug);
        window.history.pushState({ bookId: book.id }, dynamicTitle, newUrl.toString());`,
    'window.history.pushState({ bookId: book.id }, dynamicTitle, `/kinh-dien/${bookSlug}`);'
  );

  // In closeReader: replace fallback title and URLs
  code = code.replace(
    "document.title = 'Sophia Codex — Thư Viện Triết Học Toàn Cầu & Đối Thoại Socrates AI';",
    "document.title = 'Sophia Codex – Thư Viện Triết Học Số & Sách Kinh Điển';"
  );

  code = code.replace(
    "updateTag('meta[property=\"og:url\"]', 'content', 'https://vusitien.click/');",
    "updateTag('meta[property=\"og:url\"]', 'content', 'https://www.vusitien.click/');"
  );

  code = code.replace(
    "updateTag('meta[property=\"og:image\"]', 'content', 'https://vusitien.click/assets/covers/suy-tuong.svg');",
    "updateTag('meta[property=\"og:image\"]', 'content', 'https://www.vusitien.click/assets/covers/suy-tuong.svg');"
  );

  code = code.replace(
    "if (canonicalEl) canonicalEl.setAttribute('href', 'https://vusitien.click/');",
    "if (canonicalEl) canonicalEl.setAttribute('href', 'https://www.vusitien.click/');"
  );

  code = code.replace(
    `const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('book');
      window.history.pushState({}, document.title, newUrl.pathname + (newUrl.search ? newUrl.search : ''));`,
    "window.history.pushState({}, document.title, '/');"
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Successfully updated SEO Clean URLs in:', filePath);
});

// 2. UPDATE APP.JS
const appFiles = [
  'js/app.js',
  'js/pages/app.js',
  'public/js/app.js',
  'public/js/pages/app.js'
];

appFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Add clean URL pathname matching
  const searchPattern = /const params = new URLSearchParams\(window\.location\.search\);\s*const bookParam = params\.get\('book'\);/;
  const replacement = `const params = new URLSearchParams(window.location.search);
    let bookParam = params.get('book');
    const pathname = window.location.pathname;
    const cleanMatch = pathname.match(/\\/kinh-dien\\/([a-zA-Z0-9_-]+)/);
    if (cleanMatch) {
      bookParam = cleanMatch[1];
    }`;

  if (searchPattern.test(code)) {
    code = code.replace(searchPattern, replacement);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('✓ Successfully updated Clean URL pathname handling in:', filePath);
  } else {
    console.log('- App.js pattern already updated or not matched in:', filePath);
  }
});
