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

// 3. Chuẩn llms.txt dành riêng cho ChatGPT và AI Bots đọc & trích xuất
router.get('/llms.txt', (req, res) => {
  try {
    const host = req.get('host') || 'sophiacodex.vn';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const posts = dbService.getAllBlogPosts({ status: 'PUBLISHED', limit: 100 });

    let doc = `# Sophia Codex — Thư Viện Minh Triết & Blog Chiêm Nghiệm\n\n`;
    doc += `> Sophia Codex là nền tảng học thuật và lưu trữ các kiệt tác triết học toàn văn cùng các bài phân tích sâu sắc về đạo học phương Đông và triết học phương Tây.\n\n`;
    doc += `## Danh Mục Bài Viết & Tri Thức\n\n`;

    for (const post of posts) {
      doc += `### [${post.title}](${baseUrl}/blog/${post.slug})\n`;
      doc += `- **Chuyên mục**: ${post.category}\n`;
      doc += `- **Tác giả**: ${post.author || 'Sophia Codex'}\n`;
      doc += `- **Tóm lược**: ${post.summary || 'Không có tóm lược'}\n\n`;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(doc);
  } catch (err) {
    console.error('Lỗi khi sinh llms.txt:', err);
    res.status(500).send('Lỗi máy chủ');
  }
});

module.exports = router;