const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const db = new DatabaseSync('data/sophia.db');

// 1. Gather all inventory items
const inventory = [];

// Static Pages
const staticPages = [
  { url: '/', title: 'Trang chủ Sophia Codex & Đối thoại Socrates AI', type: 'Core Landing', file: 'index.html', date: '2026-11-12' },
  { url: '/thu-vien', title: 'Thư viện Toàn văn Kinh điển & Tác giả', type: 'Core Catalog', file: 'library.html', date: '2026-11-12' },
  { url: '/blog', title: 'Tạp chí Triết học & Chiêm nghiệm Sophia Blog', type: 'Hub / Archive', file: 'views/blog-list.html', date: '2026-11-12' },
  { url: '/pricing.html', title: 'Bảng giá Hội viên & Đóng góp phát triển', type: 'Transactional', file: 'pricing.html', date: '2026-11-12' },
  { url: '/privacy.html', title: 'Chính sách bảo mật thông tin', type: 'Legal / Trust', file: 'privacy.html', date: '2026-01-01' },
  { url: '/terms.html', title: 'Điều khoản sử dụng dịch vụ', type: 'Legal / Trust', file: 'terms.html', date: '2026-01-01' }
];

// Books
const books = db.prepare('SELECT id, title, original_title, author, school, category_id, read_time, year, summary, created_at, updated_at FROM books').all();
const bookItems = books.map(b => ({
  url: `/kinh-dien/${b.id}`,
  title: b.title,
  author: b.author,
  school: b.school,
  type: 'Canonical Work (Pillar)',
  read_time: b.read_time,
  year: b.year,
  summary: b.summary,
  date: b.updated_at || b.created_at
}));

// Philosophers
const phils = db.prepare('SELECT id, name, title, era, school, book_id FROM philosophers').all();
const philItems = phils.map(p => ({
  url: `/triet-gia/${p.id}`,
  title: `${p.name} - ${p.title}`,
  author: p.name,
  school: p.school,
  type: 'Entity Page',
  date: '2026-11-12',
  book_id: p.book_id
}));

// Blog Posts
const posts = db.prepare('SELECT id, slug, title, category, status, author, reading_time, content, created_at, updated_at, meta_title, meta_desc, views FROM blog_posts').all();
const blogItems = posts.map(p => {
  const mdLinks = [...p.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({ text: m[1], url: m[2] }));
  const words = p.content.trim().split(/\s+/).length;
  return {
    url: `/blog/${p.slug}`,
    title: p.title,
    category: p.category,
    author: p.author,
    type: 'Cluster Article',
    reading_time: p.reading_time,
    words,
    date: p.updated_at || p.created_at,
    meta_title: p.meta_title,
    meta_desc: p.meta_desc,
    views: p.views,
    outgoing_links: mdLinks
  };
});

// Chapters summary
const chapters = db.prepare('SELECT id, book_id, chapter_index, chapter_number, title, subtitle, reading_time_minutes FROM chapters').all();

console.log(JSON.stringify({
  staticPages,
  bookItems,
  philItems,
  blogItemsCount: blogItems.length,
  chaptersCount: chapters.length
}, null, 2));

// Save inventory to JSON for further inspection
fs.writeFileSync('scripts/inventory_data.json', JSON.stringify({
  staticPages,
  bookItems,
  philItems,
  blogItems,
  chapters: chapters.slice(0, 15) // sample
}, null, 2));

