const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/sophia.db');

const posts = db.prepare('SELECT slug, title, content FROM blog_posts').all();

console.log('=== AUDITING ALL 8 POSTS AGAINST SOPHIA-INTERNAL-LINK SOP ===\n');

const validRoutes = [
  '/',
  '/thu-vien',
  '/blog',
  '/pricing.html',
  '/privacy.html',
  '/terms.html',
  '/kinh-dien/suy-tuong',
  '/kinh-dien/dao-duc-kinh',
  '/kinh-dien/cong-hoa',
  '/kinh-dien/zarathustra',
  '/kinh-dien/ban-ve-tu-do',
  '/triet-gia/marcus-aurelius',
  '/triet-gia/lao-tzu',
  '/triet-gia/socrates',
  '/triet-gia/nietzsche',
  '/triet-gia/john-stuart-mill'
];
posts.forEach(p => validRoutes.push('/blog/' + p.slug));

let totalIssues = 0;
const report = [];

posts.forEach((p, idx) => {
  const links = [...p.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
    .map(m => ({ text: m[1], url: m[2], words: m[1].trim().split(/\s+/).length }))
    .filter(l => !l.url.startsWith('#'));

  // Check 4D topology
  const hasPillar = links.some(l => l.url.startsWith('/kinh-dien/'));
  const hasEntity = links.some(l => l.url.startsWith('/triet-gia/'));
  const hasSister = links.some(l => l.url.startsWith('/blog/'));

  const longAnchors = links.filter(l => l.words > 6);
  const invalidLinks = links.filter(l => !validRoutes.includes(l.url));

  report.push({
    index: idx + 1,
    title: p.title,
    slug: p.slug,
    totalLinks: links.length,
    topology: { hasPillar, hasEntity, hasSister },
    longAnchors,
    invalidLinks,
    links
  });
});

console.log(JSON.stringify(report, null, 2));
