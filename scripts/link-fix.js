const fs = require('fs');

function fixLinks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix footer links with valid href anchor targets for crawler discovery
  content = content.replace(/href="javascript:void\(0\)"\s+onclick="filterBooks\('stoicism'\)"/g, 'href="#school-stoicism" onclick="filterBooks(\'stoicism\')"');
  content = content.replace(/href="javascript:void\(0\)"\s+onclick="filterBooks\('eastern'\)"/g, 'href="#school-eastern" onclick="filterBooks(\'eastern\')"');
  content = content.replace(/href="javascript:void\(0\)"\s+onclick="filterBooks\('existentialism'\)"/g, 'href="#school-existentialism" onclick="filterBooks(\'existentialism\')"');
  content = content.replace(/href="javascript:void\(0\)"\s+onclick="filterBooks\('classical'\)"/g, 'href="#school-classical" onclick="filterBooks(\'classical\')"');

  // Fix brand home link
  content = content.replace(/href="javascript:void\(0\)"\s+onclick="if\(window\.readerEngine\)\s*window\.readerEngine\.closeReader\(\)"/g, 'href="/" onclick="if(window.readerEngine) window.readerEngine.closeReader()"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed internal links for:', filePath);
}

fixLinks('public/index.html');
fixLinks('index.html');
