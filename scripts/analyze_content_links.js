const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const db = new DatabaseSync('data/sophia.db');

console.log('--- 1. ANALYZING BLOG POSTS ---');
const posts = db.prepare('SELECT id, slug, title, category, status, author, reading_time, content, created_at, updated_at FROM blog_posts').all();

const blogAnalysis = posts.map(p => {
  const mdLinks = [...p.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({ text: m[1], url: m[2] }));
  const htmlLinks = [...p.content.matchAll(/href=["']([^"']+)["']/g)].map(m => ({ url: m[1] }));
  
  // Word count approx (Vietnamese/English words)
  const words = p.content.trim().split(/\s+/).length;
  
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    reading_time: p.reading_time,
    words,
    created_at: p.created_at,
    updated_at: p.updated_at,
    links: mdLinks,
    htmlLinks
  };
});

console.log(JSON.stringify(blogAnalysis, null, 2));

console.log('--- 2. ANALYZING BOOKS AND CHAPTERS ---');
const books = db.prepare('SELECT id, title, author, school, category_id, read_time, year, created_at, updated_at, summary FROM books').all();
const chaptersCount = db.prepare('SELECT book_id, count(*) as count FROM chapters GROUP BY book_id').all();

console.log('Books Summary:', books);
console.log('Chapters per book:', chaptersCount);
