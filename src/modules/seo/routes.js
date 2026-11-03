const express = require('express');
const router = express.Router();
const dbService = require('../../../server/db');

// 1. Tự động sinh sitemap.xml cập nhật trực tiếp theo thời gian thực
router.get('/sitemap.xml', (req, res) => {
  try {
    const host = req.get('host') || 'sophiacodex.vn';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Lấy tất cả bài viết đã xuất bản
    const posts = dbService.getAllBlogPosts({ status: 'PUBLISHED', limit: 1000 });

    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/blog', changefreq: 'daily', priority: 0.9 },
      { url: '/library.html', changefreq: 'weekly', priority: 0.8 },
      { url: '/pricing.html', changefreq: 'monthly', priority: 0.7 }
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

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Lỗi sinh sitemap.xml:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

// 2. Tự động sinh robots.txt chuẩn SEO & hỗ trợ AI crawlers
router.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'sophiacodex.vn';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;

  const robots = `User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Disallow: /admin
Disallow: /admin.html
Disallow: /api/admin/*

# Hỗ trợ OpenAI & Perplexity AI Search Crawler
User-agent: GPTBot
Allow: /
Allow: /blog
Allow: /llms.txt

User-agent: OAI-SearchBot
Allow: /
Allow: /blog
Allow: /llms.txt

User-agent: PerplexityBot
Allow: /
Allow: /blog
Allow: /llms.txt

User-agent: ClaudeBot
Allow: /
Allow: /blog
Allow: /llms.txt

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

// 3. Chuẩn llms.txt & llms-full.txt dành riêng cho AI Bots (ChatGPT, Perplexity, Claude, Gemini)
router.get('/llms.txt', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const host = req.get('host') || 'www.vusitien.click';
    const protocol = req.protocol || 'https';
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
      const posts = dbService.getAllBlogPosts({ status: 'PUBLISHED', limit: 20 });
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
    const fs = require('fs');
    const path = require('path');
    const llmsFullPath = path.join(__dirname, '../../..', 'llms-full.txt');
    if (fs.existsSync(llmsFullPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(fs.readFileSync(llmsFullPath, 'utf8'));
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`# Sophia Codex Full Manifest\nURL: https://www.vusitien.click/`);
  } catch (err) {
    console.error('Lỗi khi đọc llms-full.txt:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

module.exports = router;