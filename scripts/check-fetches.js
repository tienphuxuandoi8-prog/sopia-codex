const fs = require('fs');
const path = require('path');

const dirs = ['js/pages', 'js/core', 'js'];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (!fs.statSync(full).isFile() || !f.endsWith('.js')) continue;
    const content = fs.readFileSync(full, 'utf8');
    const regex = /fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const url = match[1];
      if (!url.startsWith('http') && !url.startsWith('/')) {
        console.log(`[RELATIVE FETCH] ${full}: ${url}`);
      }
    }
  }
}
console.log('Fetch scan completed.');
