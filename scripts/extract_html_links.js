const fs = require('fs');

function extractLinks(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const links = [...content.matchAll(/href=["']([^"'#][^"']*)["']/g)].map(m => m[1]);
  return Array.from(new Set(links));
}

const files = ['index.html', 'library.html', 'pricing.html', 'privacy.html', 'terms.html', 'views/blog-list.html'];
for (const f of files) {
  console.log(`=== Links in ${f} ===`);
  const links = extractLinks(f).filter(l => !l.startsWith('http') && !l.startsWith('//') && !l.endsWith('.css') && !l.endsWith('.ico') && !l.endsWith('.png'));
  console.log(links);
}
