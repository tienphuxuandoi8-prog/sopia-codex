const fs = require('fs');

// 1. index.html & public/index.html
const indexFiles = ['index.html', 'public/index.html'];
indexFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('seo-tracking.js')) {
    html = html.replace(
      '<script defer src="js/pages/app.js"></script>',
      '<script defer src="js/pages/app.js"></script>\n  <script defer src="js/seo-tracking.js"></script>'
    );
    fs.writeFileSync(file, html, 'utf8');
    console.log('✓ Attached seo-tracking.js to:', file);
  } else {
    console.log('- seo-tracking.js already present in:', file);
  }
});

// 2. views/blog-detail.html & views/blog-list.html
const blogFiles = ['views/blog-detail.html', 'views/blog-list.html'];
blogFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('seo-tracking.js')) {
    html = html.replace(
      '</body>',
      '  <!-- SEO, GEO & Retention Tracking Engine -->\n  <script defer src="/js/seo-tracking.js"></script>\n</body>'
    );
    fs.writeFileSync(file, html, 'utf8');
    console.log('✓ Attached seo-tracking.js to:', file);
  } else {
    console.log('- seo-tracking.js already present in:', file);
  }
});
