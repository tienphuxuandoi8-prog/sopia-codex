/**
 * SOPHIA CODEX - 7 QUALITY GATES AUDITOR (SKILL: SOPHIA-SEO)
 * Kiểm toán tự động 100% các tiêu chí nghiệm thu chất lượng
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName} - ${details}`);
    failCount++;
  }
}

console.log('====================================================');
console.log('KIỂM TOÁN CHẤT LƯỢNG TOÀN DIỆN (7 QUALITY GATES SOP)');
console.log('====================================================\n');

// --- GATE 1: DOMAIN & CANONICAL ---
console.log('--- GATE 1: Domain & Canonical đồng nhất www ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const publicIndexHtml = fs.readFileSync('public/index.html', 'utf8');
const libraryHtml = fs.readFileSync('library.html', 'utf8');
const blogListHtml = fs.readFileSync('views/blog-list.html', 'utf8');

assert(indexHtml.includes('<link rel="canonical" href="https://www.vusitien.click/">'), 'index.html canonical has www');
assert(publicIndexHtml.includes('<link rel="canonical" href="https://www.vusitien.click/">'), 'public/index.html canonical has www');
assert(libraryHtml.includes('<link rel="canonical" href="https://www.vusitien.click/thu-vien">'), 'library.html canonical is clean URL /thu-vien');
assert(blogListHtml.includes('<link rel="canonical" href="https://www.vusitien.click/blog">'), 'blog-list.html canonical has www full domain');
assert(indexHtml.includes('hreflang="vi" href="https://www.vusitien.click/"'), 'hreflang vi has www');

// --- GATE 2: ENCODING UTF-8 ---
console.log('\n--- GATE 2: Encoding UTF-8 không lỗi font ---');
const corruptedPatterns = [/ton văn/i, /tr tuệ/i, /tác phm/i, /tri\?t/i];
let hasCorruption = false;
corruptedPatterns.forEach(pat => {
  if (pat.test(indexHtml) || pat.test(libraryHtml)) hasCorruption = true;
});
assert(!hasCorruption, 'Không có ký tự biến dạng (ton, tr tuệ, v.v.)');

// --- GATE 3: LLM ACCESSIBILITY ---
console.log('\n--- GATE 3: LLM Accessibility (robots.txt & llms.txt) ---');
const robotsTxt = fs.readFileSync('robots.txt', 'utf8');
const requiredBots = ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'cohere-ai', 'Bingbot'];
let missingBot = false;
requiredBots.forEach(bot => {
  if (!robotsTxt.includes(`User-agent: ${bot}`)) missingBot = true;
});
assert(!missingBot, 'robots.txt cho phép đầy đủ AI crawlers & Bingbot');
assert(fs.existsSync('llms.txt'), 'llms.txt tồn tại tại root');
assert(fs.existsSync('llms-full.txt'), 'llms-full.txt tồn tại tại root');

// --- GATE 4: CLEAN URL ROUTING ---
console.log('\n--- GATE 4: Clean URL Routing ---');
const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const rewrites = vercelJson.rewrites || [];
const hasKinhDienRewrite = rewrites.some(r => r.source === '/kinh-dien/:bookId');
const hasThuVienRewrite = rewrites.some(r => r.source === '/thu-vien');
assert(hasKinhDienRewrite, 'vercel.json có rewrite /kinh-dien/:bookId');
assert(hasThuVienRewrite, 'vercel.json có rewrite /thu-vien');

const sitemapXml = fs.readFileSync('sitemap.xml', 'utf8');
assert(sitemapXml.includes('https://www.vusitien.click/kinh-dien/dao-duc-kinh'), 'sitemap.xml sử dụng Clean URL /kinh-dien/dao-duc-kinh');
assert(sitemapXml.includes('https://www.vusitien.click/thu-vien'), 'sitemap.xml sử dụng Clean URL /thu-vien');
assert(!sitemapXml.includes('.html?book='), 'sitemap.xml không còn query parameter thô');

// --- GATE 5: AEO DIRECT ANSWER ---
console.log('\n--- GATE 5: AEO Direct Answer Box ---');
assert(indexHtml.includes('Answer Engine Optimization (AEO)'), 'index.html có section AEO chuyên biệt');
assert(indexHtml.includes('Socrates AI và phương pháp đối thoại phản biện triết học hoạt động như thế nào?'), 'Direct Answer Box FAQ 1 hiện diện');
assert(indexHtml.includes('Chủ nghĩa Khắc Kỷ trong \'Suy Tưởng\' của Marcus Aurelius giúp gì cho con người hiện đại?'), 'Direct Answer Box FAQ 2 hiện diện');

// --- GATE 6: SCHEMA GRAPH VALID ---
console.log('\n--- GATE 6: Schema Graph JSON-LD Valid ---');
let parsedSchema = null;
try {
  const match = indexHtml.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (match) parsedSchema = JSON.parse(match[1].trim());
} catch (e) {}

assert(parsedSchema !== null && Array.isArray(parsedSchema['@graph']), 'index.html chứa Schema @graph hợp lệ');
const entityTypes = parsedSchema ? parsedSchema['@graph'].map(e => e['@type']) : [];
assert(entityTypes.includes('Organization') && entityTypes.includes('FAQPage') && entityTypes.includes('Book'), 'Schema có đủ Organization, FAQPage, Book');
const marcusEntity = parsedSchema ? parsedSchema['@graph'].find(e => e.name === 'Marcus Aurelius') : null;
assert(marcusEntity && marcusEntity.sameAs && marcusEntity.sameAs.some(s => s.includes('wikidata.org')), 'Person Schema liên kết Wikidata Entity Grounding');

// --- GATE 7: EVENT TRACKING READY ---
console.log('\n--- GATE 7: Event Tracking & Retention Engine ---');
assert(fs.existsSync('js/seo-tracking.js'), 'js/seo-tracking.js tồn tại');
assert(fs.existsSync('public/js/seo-tracking.js'), 'public/js/seo-tracking.js tồn tại');
const trackingCode = fs.readFileSync('js/seo-tracking.js', 'utf8');
assert(trackingCode.includes('ai_dialogue_started'), 'Tracking mã lắng nghe ai_dialogue_started');
assert(trackingCode.includes('ai_dialogue_deep'), 'Tracking mã lắng nghe ai_dialogue_deep');
assert(trackingCode.includes('quote_highlighted'), 'Tracking mã lắng nghe quote_highlighted');
assert(trackingCode.includes('audio_ambient_played'), 'Tracking mã lắng nghe audio_ambient_played');
assert(trackingCode.includes('scroll_depth_90'), 'Tracking mã lắng nghe scroll_depth_90');
assert(trackingCode.includes('citationFooter'), 'Academic Citation Hook được tích hợp vào sự kiện copy');

assert(indexHtml.includes('seo-tracking.js'), 'index.html đã nhúng seo-tracking.js');
assert(publicIndexHtml.includes('seo-tracking.js'), 'public/index.html đã nhúng seo-tracking.js');
assert(libraryHtml.includes('seo-tracking.js'), 'library.html đã nhúng seo-tracking.js');
assert(blogListHtml.includes('seo-tracking.js'), 'blog-list.html đã nhúng seo-tracking.js');

console.log('\n====================================================');
console.log(`KẾT QUẢ KIỂM TOÁN: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount === 0) {
  console.log('🎉 TẤT CẢ 7 QUALITY GATES ĐẠT CHUẨN 100%! HỆ THỐNG SẴN SÀNG PRODUCTION!');
} else {
  console.log('⚠️ Cần xử lý các tiêu chí failed phía trên.');
  process.exit(1);
}
console.log('====================================================\n');
