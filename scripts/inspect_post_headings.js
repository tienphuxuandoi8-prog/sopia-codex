const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/sophia.db');

const posts = db.prepare('SELECT slug, title, category, author, content FROM blog_posts').all();

posts.forEach((p, idx) => {
  console.log(`\n========================================`);
  console.log(`[${idx + 1}] SLUG: ${p.slug}`);
  console.log(`TITLE: ${p.title}`);
  console.log(`CATEGORY: ${p.category} | AUTHOR: ${p.author}`);
  
  // Extract headings
  const headings = [...p.content.matchAll(/^(#{1,4})\s+(.+)$/gm)].map(m => `${m[1]} ${m[2]}`);
  console.log(`HEADINGS:`, headings);
  
  // Extract sample paragraph
  const lines = p.content.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#') && !l.startsWith('-'));
  console.log(`INTRO SNIPPET:`, lines.slice(0, 2).join(' '));
});
