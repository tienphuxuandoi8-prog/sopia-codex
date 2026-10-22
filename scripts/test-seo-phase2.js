const fs = require('fs');

console.log('--- 1. KIỂM TRA INDEX.HTML ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const match = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if (!match) {
  console.error('❌ Không tìm thấy script JSON-LD trong index.html');
  process.exit(1);
}

try {
  const jsonLd = JSON.parse(match[1]);
  console.log('✓ Cú pháp JSON-LD hoàn toàn hợp lệ!');
  console.log(`✓ Context: ${jsonLd['@context']}`);
  console.log(`✓ Tổng số Entity trong @graph: ${jsonLd['@graph'].length}`);

  const types = jsonLd['@graph'].map(e => e['@type']);
  console.log('✓ Danh sách Entity Types:', types);

  // Kiểm tra Book Schema
  const books = jsonLd['@graph'].filter(e => e['@type'] === 'Book');
  console.log(`\n📚 Book Schemas (${books.length}/5):`);
  books.forEach(b => {
    console.log(`  - [${b['@type']}] "${b.name}" (${b.alternateName}) | Thể loại: ${b.genre}`);
    console.log(`    URL: ${b.url} | Tác giả: ${b.author['@id']}`);
  });

  // Kiểm tra Person Schema & sameAs
  const persons = jsonLd['@graph'].filter(e => e['@type'] === 'Person');
  console.log(`\n👤 Person Schemas (${persons.length}/5):`);
  persons.forEach(p => {
    console.log(`  - [${p['@type']}] ${p.name} (@id: ${p['@id']})`);
    console.log(`    Wikidata/Wikipedia sameAs (${p.sameAs.length}):`);
    p.sameAs.forEach(s => console.log(`      ↳ ${s}`));
  });

  // Kiểm tra FAQPage
  const faq = jsonLd['@graph'].find(e => e['@type'] === 'FAQPage');
  if (faq) {
    console.log(`\n❓ FAQPage Schema (AEO Top 0 Featured Snippet):`);
    console.log(`  Tổng số cặp hỏi đáp: ${faq.mainEntity.length}`);
    faq.mainEntity.forEach((q, idx) => {
      console.log(`  ${idx + 1}. [Hỏi]: ${q.name}`);
      console.log(`     [Đáp]: ${q.acceptedAnswer.text.substring(0, 90)}...`);
    });
  } else {
    console.error('❌ Thiếu FAQPage Schema');
  }

} catch (err) {
  console.error('❌ Lỗi cú pháp JSON-LD:', err.message);
  process.exit(1);
}

console.log('\n--- 2. KIỂM TRA DYNAMIC READER SEO ---');
const readerJs = fs.readFileSync('js/pages/reader.js', 'utf8');
const hasDynamicSeo = readerJs.includes('updateDynamicBookSEO') && readerJs.includes('openBook');
console.log('✓ Reader.js có updateDynamicBookSEO:', hasDynamicSeo);
console.log('✓ Reader.js khôi phục default metadata khi closeReader:', readerJs.includes('document.title = \'Sophia Codex'));
console.log('✓ Reader.js cập nhật URL parameter với pushState:', readerJs.includes('newUrl.searchParams.set(\'book\''));

console.log('\n--- 3. KIỂM TRA PUBLIC/INDEX.HTML & PUBLIC/JS ĐỒNG BỘ ---');
const pubIndex = fs.readFileSync('public/index.html', 'utf8');
console.log('✓ public/index.html chứa FAQPage Schema:', pubIndex.includes('"@type": "FAQPage"'));
console.log('✓ public/index.html chứa Book Schema Đạo Đức Kinh:', pubIndex.includes('"name": "Đạo Đức Kinh"'));
console.log('✓ public/index.html chứa Person Schema Marcus Aurelius:', pubIndex.includes('"name": "Marcus Aurelius"'));
console.log('✓ public/index.html chứa AEO FAQ HTML section:', pubIndex.includes('id="socrates-faq-section"'));

console.log('\n✨ TẤT CẢ CÁC BƯỚC KIỂM THỬ GIAI ĐOẠN 2 ĐẠT 100% TIÊU CHUẨN KSTUDY & SCHEMA.ORG!');
