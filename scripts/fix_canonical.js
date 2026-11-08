const fs = require('fs');

const files = ['index.html', 'public/index.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/href="https:\/\/vusitien\.click\/"/g, 'href="https://www.vusitien.click/"');
    content = content.replace(/content="https:\/\/vusitien\.click\/"/g, 'content="https://www.vusitien.click/"');
    fs.writeFileSync(file, content, 'utf8');
    console.log('✓ Successfully updated canonical and hreflang in:', file);
  }
});

// Update blog-list.html
const blogListPath = 'views/blog-list.html';
if (fs.existsSync(blogListPath)) {
  let content = fs.readFileSync(blogListPath, 'utf8');
  content = content.replace('<link rel="canonical" href="/blog">', '<link rel="canonical" href="https://www.vusitien.click/blog">');
  content = content.replace('<meta property="og:url" content="/blog">', '<meta property="og:url" content="https://www.vusitien.click/blog">');
  fs.writeFileSync(blogListPath, content, 'utf8');
  console.log('✓ Successfully updated canonical and og:url in:', blogListPath);
}
