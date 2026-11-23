const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const regex = /(?:src|href)="([^"#][^"]*)"/g;
let match;
const relative = [];
const absolute = [];
while ((match = regex.exec(content)) !== null) {
  const url = match[1];
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:') && !url.startsWith('javascript:')) {
    if (url.startsWith('/')) {
      absolute.push(url);
    } else {
      relative.push(url);
    }
  }
}
console.log('RELATIVE URLS (' + relative.length + '):');
console.log([...new Set(relative)].sort());
console.log('\nABSOLUTE URLS (' + absolute.length + '):');
console.log([...new Set(absolute)].sort());
