const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const targets = ['assets/covers/', 'css/tailwind.min.css', 'css/style.css', 'manifest.json', 'sw.js', 'js/', 'login.html', 'register.html', 'library.html', 'pricing.html', 'account.html', 'admin.html'];
lines.forEach((l, idx) => {
  if (targets.some(t => l.includes(t)) && !l.includes('http://') && !l.includes('https://') && !l.includes('www.')) {
    if (l.match(/(?:href|src|register)\s*[(=]\s*['"](?!\/)[^'"]+/)) {
      console.log((idx+1) + ': ' + l.trim());
    }
  }
});
