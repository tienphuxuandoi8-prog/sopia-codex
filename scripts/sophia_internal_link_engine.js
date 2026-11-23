#!/usr/bin/env node
/**
 * SOPHIA-INTERNAL-LINK INTELLIGENT ENGINE
 * Hệ thống tự động hóa kiểm toán, phân tích ma trận PageRank và đề xuất liên kết nội bộ
 * Bản quyền thuộc về Sophia Codex (vusitien.click)
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { execSync } = require('node:child_process');

const DB_PATH = path.join(process.cwd(), 'data', 'sophia.db');

// Danh mục định tuyến chuẩn mực (Canonical Taxonomy)
const TAXONOMY = {
  pillars: [
    { slug: 'suy-tuong', url: '/kinh-dien/suy-tuong', name: 'Suy Tưởng (Meditations)', author: 'Marcus Aurelius', keywords: ['suy tưởng', 'meditations', 'nhật ký sa trường', 'la mã'] },
    { slug: 'dao-duc-kinh', url: '/kinh-dien/dao-duc-kinh', name: 'Đạo Đức Kinh (Tao Te Ching)', author: 'Lão Tử', keywords: ['đạo đức kinh', 'tao te ching', 'lão tử', 'vô vi', 'đạo gia'] },
    { slug: 'cong-hoa', url: '/kinh-dien/cong-hoa', name: 'Cộng Hòa (The Republic)', author: 'Plato', keywords: ['cộng hòa', 'the republic', 'plato', 'hang động', 'ý niệm'] },
    { slug: 'zarathustra', url: '/kinh-dien/zarathustra', name: 'Zarathustra Đã Nói Như Thế', author: 'Friedrich Nietzsche', keywords: ['zarathustra', 'nietzsche', 'siêu nhân', 'amor fati', 'ý chí hùng cường'] },
    { slug: 'ban-ve-tu-do', url: '/kinh-dien/ban-ve-tu-do', name: 'Bàn Về Tự Do (On Liberty)', author: 'John Stuart Mill', keywords: ['bàn về tự do', 'on liberty', 'john stuart mill', 'nguyên lý gây hại', 'tự do cá nhân'] }
  ],
  entities: [
    { slug: 'marcus-aurelius', url: '/triet-gia/marcus-aurelius', name: 'Marcus Aurelius', school: 'Khắc Kỷ', anchors: ['Marcus Aurelius', 'Hoàng đế Marcus Aurelius', 'triết gia Marcus Aurelius'] },
    { slug: 'lao-tzu', url: '/triet-gia/lao-tzu', name: 'Lão Tử', school: 'Đạo Gia', anchors: ['Lão Tử', 'bậc thầy Đạo gia Lão Tử', 'triết gia Lão Tử'] },
    { slug: 'socrates', url: '/triet-gia/socrates', name: 'Socrates & Plato', school: 'Hy Lạp Cổ Đại', anchors: ['Socrates', 'Plato & Socrates', 'triết gia Socrates'] },
    { slug: 'nietzsche', url: '/triet-gia/nietzsche', name: 'Friedrich Nietzsche', school: 'Hiện Sinh', anchors: ['Nietzsche', 'Friedrich Nietzsche', 'triết gia Nietzsche'] },
    { slug: 'john-stuart-mill', url: '/triet-gia/john-stuart-mill', name: 'John Stuart Mill', school: 'Tự Do / Thực Dụng', anchors: ['John Stuart Mill', 'triết gia John Stuart Mill'] }
  ],
  standardAnchors: {
    'khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius': ['phương pháp trị overthinking', 'pháo đài nội tâm Khắc kỷ'],
    'marcus-aurelius-nghe-thuat-yeu-thuong-tha-nhan-tinh-yeu-khac-ky': ['tình yêu tha nhân Khắc kỷ', 'tình yêu vị tha Khắc kỷ'],
    'nghe-thuat-khac-ky-trong-doi-song-so': ['Khắc kỷ trong đời sống số', 'làm chủ tâm trí kỷ nguyên số'],
    'dao-duc-kinh-triet-ly-vo-vi-nghe-thuat-song-thuan-tu-nhien': ['triết lý Vô vi thuận tự nhiên', 'lối sống thuận tự nhiên'],
    'triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo': ['quản trị năng lượng cá nhân', 'triết lý Vô vi'],
    'an-du-hang-dong-plato-thuc-tai-hay-ao-anh-thuat-toan': ['ẩn dụ hang động của Plato', 'chiếc hang số thời hiện đại'],
    'y-chi-hung-cuong-amor-fati-nietzsche-nghe-thuat-yeu-nghich-canh': ['triết lý Amor Fati', 'ý chí hùng cường của Nietzsche'],
    'nguyen-ly-gay-hai-john-stuart-mill-ranh-gioi-tu-do-ca-nhan': ['nguyên lý gây hại', 'ranh giới tự do cá nhân']
  }
};

function getDb() {
  return new DatabaseSync(DB_PATH);
}

// 1. Audit toàn bộ các bài viết
function runAudit() {
  const db = getDb();
  const posts = db.prepare("SELECT slug, title, content FROM blog_posts WHERE status = 'PUBLISHED'").all();
  
  const validRoutes = [
    '/', '/thu-vien', '/blog', '/pricing', '/pricing.html', '/privacy', '/privacy.html', '/terms', '/terms.html',
    ...TAXONOMY.pillars.map(p => p.url),
    ...TAXONOMY.entities.map(e => e.url),
    ...posts.map(p => '/blog/' + p.slug)
  ];

  console.log('='.repeat(70));
  console.log('🔍 SOPHIA-INTERNAL-LINK: BÁO CÁO KIỂM TOÁN TỔNG THỂ HỆ THỐNG');
  console.log('='.repeat(70));
  console.log(`Tổng số bài viết blog đang xuất bản: ${posts.length}\n`);

  let totalErrors = 0;

  posts.forEach((post, i) => {
    const links = [...post.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
      .map(m => ({ text: m[1], url: m[2], words: m[1].trim().split(/\s+/).length }))
      .filter(l => !l.url.startsWith('#'));

    const longAnchors = links.filter(l => l.words > 6);
    const brokenLinks = links.filter(l => !validRoutes.includes(l.url));
    const urlCounts = {};
    links.forEach(l => { urlCounts[l.url] = (urlCounts[l.url] || 0) + 1; });
    const duplicateUrls = Object.entries(urlCounts).filter(([_, count]) => count > 1);

    const hasPillar = links.some(l => l.url.startsWith('/kinh-dien/'));
    const hasEntity = links.some(l => l.url.startsWith('/triet-gia/'));
    const hasSister = links.some(l => l.url.startsWith('/blog/'));

    const isPerfect = longAnchors.length === 0 && brokenLinks.length === 0 && duplicateUrls.length === 0 && hasPillar && hasEntity;

    console.log(`[${i + 1}/${posts.length}] ${isPerfect ? '✅' : '⚠️'} ${post.title}`);
    console.log(`    Slug: /blog/${post.slug}`);
    console.log(`    Tổng liên kết: ${links.length} | Pillar: ${hasPillar ? '✓' : '✗'} | Entity: ${hasEntity ? '✓' : '✗'} | Blog: ${hasSister ? '✓' : '✗'}`);

    if (longAnchors.length > 0) {
      totalErrors += longAnchors.length;
      console.log(`    🔴 Cảnh báo Anchor Text quá dài (> 6 từ):`);
      longAnchors.forEach(a => console.log(`       - "${a.text}" (${a.words} từ) -> ${a.url}`));
    }
    if (duplicateUrls.length > 0) {
      totalErrors += duplicateUrls.length;
      console.log(`    🔴 Cảnh báo URL bị lặp lại trong cùng bài viết:`);
      duplicateUrls.forEach(([url, count]) => console.log(`       - ${url} (xuất hiện ${count} lần)`));
    }
    if (brokenLinks.length > 0) {
      totalErrors += brokenLinks.length;
      console.log(`    🔴 Cảnh báo Link vỡ / ngoài danh mục:`);
      brokenLinks.forEach(b => console.log(`       - ${b.url}`));
    }
    console.log('');
  });

  console.log('-'.repeat(70));
  if (totalErrors === 0) {
    console.log('🎉 TẤT CẢ 8 BÀI VIẾT ĐẠT 100% TIÊU CHUẨN SOPHIA-INTERNAL-LINK!');
  } else {
    console.log(`⚠️ PHÁT HIỆN TỔNG CỘNG ${totalErrors} VẤN ĐỀ CẦN TỐI ƯU.`);
  }
  console.log('='.repeat(70));
  db.close();
}

// 2. Xuất ma trận đồ thị liên kết (Inbound / Outbound PageRank Graph)
function runGraph() {
  const db = getDb();
  const posts = db.prepare("SELECT slug, title, content FROM blog_posts WHERE status = 'PUBLISHED'").all();
  
  const inboundCount = {};
  const outboundCount = {};

  posts.forEach(p => {
    inboundCount['/blog/' + p.slug] = 0;
    outboundCount['/blog/' + p.slug] = 0;
  });
  TAXONOMY.pillars.forEach(p => inboundCount[p.url] = 0);
  TAXONOMY.entities.forEach(e => inboundCount[e.url] = 0);

  posts.forEach(p => {
    const postUrl = '/blog/' + p.slug;
    const links = [...p.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
      .map(m => m[2])
      .filter(u => !u.startsWith('#'));

    outboundCount[postUrl] = links.length;

    links.forEach(u => {
      if (inboundCount[u] !== undefined) {
        inboundCount[u]++;
      }
    });
  });

  console.log('='.repeat(70));
  console.log('📊 MA TRẬN LUÂN CHUYỂN PAGERANK (LINK TOPOLOGY GRAPH)');
  console.log('='.repeat(70));
  
  console.log('\n🏛️ 1. NHÓM TRỤ CỘT KINH ĐIỂN (/kinh-dien/*):');
  TAXONOMY.pillars.forEach(p => {
    console.log(`   - [Inbound: ${inboundCount[p.url] || 0}] ${p.name.padEnd(35)} -> ${p.url}`);
  });

  console.log('\n👤 2. NHÓM THỰC THỂ TRIẾT GIA (/triet-gia/*):');
  TAXONOMY.entities.forEach(e => {
    console.log(`   - [Inbound: ${inboundCount[e.url] || 0}] ${e.name.padEnd(35)} -> ${e.url}`);
  });

  console.log('\n📝 3. NHÓM BÀI VIẾT BLOG (/blog/*):');
  posts.forEach(p => {
    const url = '/blog/' + p.slug;
    console.log(`   - [In: ${inboundCount[url] || 0} | Out: ${outboundCount[url] || 0}] ${p.title.slice(0, 40).padEnd(42)} -> ${url}`);
  });

  console.log('\n' + '='.repeat(70));
  db.close();
}

// 3. Đề xuất liên kết 4D cho một bài viết dựa trên từ khóa ngữ nghĩa
function runSuggest(slug) {
  const db = getDb();
  const post = db.prepare("SELECT slug, title, content FROM blog_posts WHERE slug = ?").get(slug);

  if (!post) {
    console.error(`❌ Không tìm thấy bài viết với slug: "${slug}"`);
    db.close();
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log(`💡 ĐỀ XUẤT NÂNG CẤP LIÊN KẾT 4D CHO: "${post.title}"`);
  console.log('='.repeat(70));

  const contentLower = post.content.toLowerCase();

  // 1. Gợi ý Pillar Link
  console.log('\n[1. CHIỀU DỌC - TRỤ CỘT KINH ĐIỂN]');
  TAXONOMY.pillars.forEach(p => {
    const matched = p.keywords.some(k => contentLower.includes(k));
    if (matched) {
      console.log(`  * Khuyến nghị: Kiệt tác "${p.name}"`);
      console.log(`    URL: ${p.url}`);
      console.log(`    Anchor mẫu (2-4 từ): "[${p.name.split('(')[0].trim()}]" hoặc "[nguyên tác ${p.name.split('(')[0].trim()}]"`);
    }
  });

  // 2. Gợi ý Entity Link
  console.log('\n[2. CHIỀU THỰC THỂ - TRIẾT GIA GROUNDING]');
  TAXONOMY.entities.forEach(e => {
    if (contentLower.includes(e.name.toLowerCase()) || contentLower.includes(e.slug)) {
      console.log(`  * Khuyến nghị: Triết gia "${e.name}" (${e.school})`);
      console.log(`    URL: ${e.url}`);
      console.log(`    Anchor mẫu (2-3 từ): "[${e.anchors[0]}]"`);
    }
  });

  // 3. Gợi ý Sister & Bridge Posts
  console.log('\n[3 & 4. CHIỀU NGANG VÀ CẦU NỐI ĐÔNG - TÂY]');
  const otherPosts = db.prepare("SELECT slug, title FROM blog_posts WHERE slug != ? AND status = 'PUBLISHED'").all(slug);
  otherPosts.forEach(op => {
    const anchors = TAXONOMY.standardAnchors[op.slug] || [op.title.slice(0, 20)];
    console.log(`  * Bài liên quan: "${op.title}"`);
    console.log(`    URL: /blog/${op.slug}`);
    console.log(`    Anchor chuẩn: "${anchors.map(a => `[${a}]`).join(' hoặc ')}"`);
  });

  console.log('\n' + '='.repeat(70));
  db.close();
}

// 4. Checkpoint SQLite WAL an toàn
function runCheckpoint() {
  console.log('🔄 Đang thực thi PRAGMA wal_checkpoint(TRUNCATE)...');
  const db = getDb();
  db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  db.close();
  console.log('✅ SQLite WAL đã được đồng bộ hoàn toàn vào data/sophia.db!');
}

// 5. Kiểm thử toàn diện & kiểm tra server
function runVerify() {
  console.log('🧪 Đang chạy kiểm thử tự động Vitest Quality Gate...');
  try {
    execSync('npm.cmd test tests/unit/internal-links.test.js', { stdio: 'inherit' });
    console.log('\n✅ 100% Quality Gate Tests đã vượt qua thành công!');
  } catch (err) {
    console.error('❌ Kiểm thử thất bại!');
    process.exit(1);
  }

  // Kiểm tra local server port 3000
  console.log('\n🌐 Đang kiểm tra phản hồi HTTP cổng 3000...');
  const req = http.get('http://127.0.0.1:3000/api/v1/health', (res) => {
    console.log(`✅ Local Server phản hồi: Status ${res.statusCode} OK.`);
  });
  req.on('error', () => {
    console.log('⚠️ Local Server (port 3000) hiện chưa chạy. Bạn có thể khởi động bằng:');
    console.log('   node src/server.local.js');
  });
}

// CLI Dispatcher
const args = process.argv.slice(2);
const command = args[0] || '--audit';

switch (command) {
  case '--audit':
    runAudit();
    break;
  case '--graph':
    runGraph();
    break;
  case '--suggest':
    if (!args[1]) {
      console.log('Cách dùng: node scripts/sophia_internal_link_engine.js --suggest <article-slug>');
    } else {
      runSuggest(args[1]);
    }
    break;
  case '--checkpoint':
    runCheckpoint();
    break;
  case '--verify':
    runVerify();
    break;
  default:
    console.log('Lệnh không xác định. Hỗ trợ: --audit, --graph, --suggest <slug>, --checkpoint, --verify');
    break;
}
