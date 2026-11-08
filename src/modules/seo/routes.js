const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dbService = require('../../../server/db');

const DEFAULT_DOMAIN = 'www.vusitien.click';

// 1. Tự động sinh sitemap.xml cập nhật trực tiếp theo thời gian thực (Chuẩn Clean URLs)
router.get('/sitemap.xml', (req, res) => {
  try {
    const rootSitemapPath = path.join(__dirname, '../../..', 'sitemap.xml');
    if (fs.existsSync(rootSitemapPath)) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.send(fs.readFileSync(rootSitemapPath, 'utf8'));
    }

    const host = req.get('host') || DEFAULT_DOMAIN;
    const protocol = req.protocol === 'http' && !req.get('x-forwarded-proto') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Lấy tất cả bài viết đã xuất bản
    const posts = dbService.getAllBlogPosts ? dbService.getAllBlogPosts({ status: 'PUBLISHED', limit: 1000 }) : [];
    const books = dbService.getAllBooks ? dbService.getAllBooks() : [];
    const philosophers = dbService.getAllPhilosophers ? dbService.getAllPhilosophers() : [];

    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/thu-vien', changefreq: 'daily', priority: 0.9 },
      { url: '/blog', changefreq: 'daily', priority: 0.9 },
      { url: '/pricing.html', changefreq: 'weekly', priority: 0.8 },
      { url: '/privacy.html', changefreq: 'yearly', priority: 0.3 },
      { url: '/terms.html', changefreq: 'yearly', priority: 0.3 }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Classic Books
    for (const book of books) {
      if (book.status && book.status !== 'published') continue;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/kinh-dien/${encodeURIComponent(book.id)}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    // Philosophers
    for (const phil of philosophers) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/triet-gia/${encodeURIComponent(phil.id)}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Blog posts
    for (const post of posts) {
      const lastMod = new Date(post.updated_at || post.created_at).toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('Lỗi sinh sitemap.xml:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

// 2. Tự động phục vụ robots.txt chuẩn SEO, AEO & hỗ trợ AI crawlers
router.get('/robots.txt', (req, res) => {
  try {
    const rootRobotsPath = path.join(__dirname, '../../..', 'robots.txt');
    if (fs.existsSync(rootRobotsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(fs.readFileSync(rootRobotsPath, 'utf8'));
    }

    const host = req.get('host') || DEFAULT_DOMAIN;
    const protocol = req.protocol === 'http' && !req.get('x-forwarded-proto') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const robots = `# SOPHIA CODEX - ROBOTS.TXT
User-agent: *
Allow: /
Allow: /thu-vien
Allow: /library.html
Allow: /kinh-dien/
Allow: /blog/
Disallow: /admin
Disallow: /admin.html
Disallow: /account.html
Disallow: /api/admin/

# AI Search Crawlers (GEO Ready)
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

# International Search Engines
User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: YandexBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 1

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(robots);
  } catch (err) {
    console.error('Lỗi khi đọc robots.txt:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

// 3. Chuẩn llms.txt & llms-full.txt dành riêng cho AI Bots (ChatGPT, Perplexity, Claude, Gemini)
router.get('/llms.txt', (req, res) => {
  try {
    const host = req.get('host') || DEFAULT_DOMAIN;
    const protocol = req.protocol === 'http' && !req.get('x-forwarded-proto') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let doc = '';
    const llmsPath = path.join(__dirname, '../../..', 'llms.txt');
    if (fs.existsSync(llmsPath)) {
      doc = fs.readFileSync(llmsPath, 'utf8');
    } else {
      doc = `# Sophia Codex (${baseUrl})\n\n> Thư viện Triết học Toàn văn Toàn cầu & AI Socrates.\n\n`;
    }

    // Nối thêm danh mục bài viết Blog phân tích học thuật mới nhất
    try {
      const posts = dbService.getAllBlogPosts ? dbService.getAllBlogPosts({ status: 'PUBLISHED', limit: 20 }) : [];
      if (posts && posts.length > 0) {
        doc += `\n## Bài Viết & Phân Tích Học Thuật Mới Nhất\n\n`;
        for (const post of posts) {
          doc += `### [${post.title}](${baseUrl}/blog/${post.slug})\n`;
          doc += `- **Chuyên mục**: ${post.category}\n`;
          doc += `- **Tác giả**: ${post.author || 'Sophia Codex'}\n`;
          doc += `- **Tóm lược**: ${post.summary || 'Bài phân tích triết học sâu sắc tại Sophia Codex.'}\n\n`;
        }
      }
    } catch (e) {
      // Bỏ qua nếu db chưa sẵn sàng trong một số môi trường
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(doc);
  } catch (err) {
    console.error('Lỗi khi đọc llms.txt:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

router.get('/llms-full.txt', (req, res) => {
  try {
    const llmsFullPath = path.join(__dirname, '../../..', 'llms-full.txt');
    if (fs.existsSync(llmsFullPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(fs.readFileSync(llmsFullPath, 'utf8'));
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`# Sophia Codex Full Manifest\nURL: https://${DEFAULT_DOMAIN}/`);
  } catch (err) {
    console.error('Lỗi khi đọc llms-full.txt:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

module.exports = router;
