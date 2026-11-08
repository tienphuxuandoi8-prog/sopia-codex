const fs = require('fs');

let code = fs.readFileSync('src/app.js', 'utf8');

const target1 = `// --- 8. Fallback cho Single Page / Client Pages ---
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});`;

const replacement = `// --- 8. Clean URL Routing & Fallback cho Single Page / Client Pages ---
app.get(['/thu-vien', '/library'], (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'library.html'));
});

app.get('/kinh-dien/:bookId', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/triet-gia/:philosopherId', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/bai-viet/:slug', (req, res) => {
  res.redirect(301, '/blog/' + req.params.slug);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement);
  fs.writeFileSync('src/app.js', code, 'utf8');
  console.log('✓ Successfully updated Clean URL routes in src/app.js (LF)');
} else {
  const targetCRLF = target1.replace(/\n/g, '\r\n');
  if (code.includes(targetCRLF)) {
    code = code.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
    fs.writeFileSync('src/app.js', code, 'utf8');
    console.log('✓ Successfully updated Clean URL routes in src/app.js (CRLF)');
  } else {
    console.error('✗ Target not found in src/app.js');
  }
}
