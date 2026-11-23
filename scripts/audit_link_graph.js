const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const db = new DatabaseSync('data/sophia.db');
const posts = db.prepare('SELECT slug, title, content FROM blog_posts').all();

console.log('--- LINK AUDIT IN BLOG POSTS ---');

const linkGraph = {};

posts.forEach(p => {
  const currentUrl = `/blog/${p.slug}`;
  linkGraph[currentUrl] = {
    title: p.title,
    outgoing: [],
    incoming: []
  };
});

// Also include canonical books and entity pages
const books = ['dao-duc-kinh', 'suy-tuong', 'cong-hoa', 'zarathustra', 'ban-ve-tu-do'];
books.forEach(b => {
  linkGraph[`/kinh-dien/${b}`] = { title: `Kinh điển: ${b}`, outgoing: [], incoming: [] };
});
const phils = ['marcus-aurelius', 'socrates', 'lao-tzu', 'nietzsche', 'john-stuart-mill'];
phils.forEach(p => {
  linkGraph[`/triet-gia/${p}`] = { title: `Triết gia: ${p}`, outgoing: [], incoming: [] };
});

posts.forEach(p => {
  const currentUrl = `/blog/${p.slug}`;
  const mdLinks = [...p.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  mdLinks.forEach(m => {
    const text = m[1];
    let url = m[2];
    if (url.startsWith('#')) return; // ignore anchor links inside page
    linkGraph[currentUrl].outgoing.push({ text, url });
    if (linkGraph[url]) {
      linkGraph[url].incoming.push({ from: currentUrl, text });
    }
  });
});

console.log(JSON.stringify(linkGraph, null, 2));
