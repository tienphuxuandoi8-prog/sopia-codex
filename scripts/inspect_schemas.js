const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
let m;
let i = 0;
while ((m = regex.exec(html)) !== null) {
  console.log(`\n=== SCHEMA BLOCK ${++i} ===`);
  try {
    const json = JSON.parse(m[1].trim());
    if (json['@graph']) {
      console.log(`@graph chứa ${json['@graph'].length} thực thể:`);
      json['@graph'].forEach(e => console.log(`  - Type: ${e['@type']}, Name: ${e.name || e.headline || '(no name)'}`));
    } else {
      console.log(`Type: ${json['@type']}, Name: ${json.name || '(no name)'}`);
    }
  } catch(e) {
    console.log('Error parse JSON:', e.message);
  }
}
