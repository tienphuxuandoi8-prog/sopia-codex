const fs = require('fs');

console.log('=== TEST 1: ROBOTS.TXT ===');
const robotsRoot = fs.existsSync('./robots.txt');
const robotsPub = fs.existsSync('./public/robots.txt');
console.log('robots.txt in root:', robotsRoot);
console.log('robots.txt in public:', robotsPub);
if (robotsRoot) {
  const content = fs.readFileSync('./robots.txt', 'utf8');
  console.log('Contains GPTBot:', content.includes('User-agent: GPTBot'));
  console.log('Contains PerplexityBot:', content.includes('User-agent: PerplexityBot'));
  console.log('Contains Google-Extended:', content.includes('User-agent: Google-Extended'));
  console.log('Contains Disallow admin:', content.includes('Disallow: /admin.html'));
  console.log('Contains Sitemap link:', content.includes('Sitemap: https://vusitien.click/sitemap.xml'));
}

console.log('\n=== TEST 2: SITEMAP.XML ===');
const sitemapRoot = fs.existsSync('./sitemap.xml');
const sitemapPub = fs.existsSync('./public/sitemap.xml');
console.log('sitemap.xml in root:', sitemapRoot);
console.log('sitemap.xml in public:', sitemapPub);
if (sitemapRoot) {
  const sContent = fs.readFileSync('./sitemap.xml', 'utf8');
  const countUrls = (sContent.match(/<url>/g) || []).length;
  console.log('Total URLs indexed:', countUrls);
  console.log('Contains Home:', sContent.includes('https://vusitien.click/'));
  console.log('Contains Library:', sContent.includes('https://vusitien.click/library.html'));
  console.log('Contains Dao Duc Kinh:', sContent.includes('book=dao-duc-kinh'));
  console.log('Contains Suy Tuong:', sContent.includes('book=suy-tuong'));
  console.log('Contains Blog:', sContent.includes('blog-detail.html'));
}

console.log('\n=== TEST 3: INDEX.HTML META & SCHEMA ===');
const indexContent = fs.readFileSync('./index.html', 'utf8');
console.log('Has Meta Description:', indexContent.includes('name="description"'));
console.log('Has Canonical Link:', indexContent.includes('rel="canonical"'));
console.log('Has OpenGraph Title:', indexContent.includes('property="og:title"'));
console.log('Has Twitter Card:', indexContent.includes('name="twitter:card"'));
console.log('Has JSON-LD Schema:', indexContent.includes('application/ld+json'));

const jsonLdMatch = indexContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (jsonLdMatch) {
  try {
    const parsed = JSON.parse(jsonLdMatch[1]);
    console.log('JSON-LD parse success! Registered types:', parsed['@graph'].map(g => g['@type']));
  } catch (e) {
    console.error('JSON-LD parse error:', e.message);
  }
}
