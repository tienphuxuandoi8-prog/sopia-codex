const fs = require('fs');
const path = require('path');

function scanHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git' && f !== '.agent') {
      scanHtmlFiles(full);
    } else if (f.endsWith('.html')) {
      checkFile(full);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasBase = /<base\s+href=/i.test(content);
  const regex = /(?:src|href)="([^"#][^"]*)"/g;
  let match;
  const rels = new Set();
  while ((match = regex.exec(content)) !== null) {
    const url = match[1];
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:') && !url.startsWith('javascript:')) {
      if (!url.startsWith('/')) {
        rels.add(url);
      }
    }
  }
  if (rels.size > 0) {
    console.log(`[${filePath}] hasBase=${hasBase}, ${rels.size} relative URLs:`);
    console.log(Array.from(rels).slice(0, 10));
  }
}

scanHtmlFiles('.');
