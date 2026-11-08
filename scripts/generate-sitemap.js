/**
 * SOPHIA CODEX - SITEMAP XML GENERATOR
 * Tự động quét cơ sở dữ liệu SQLite (books, chapters, philosophers, blog posts)
 * và các trang tĩnh quan trọng để sinh ra file sitemap.xml chuẩn Clean URLs, SEO, AEO & GEO.
 *
 * Tiêu chuẩn kỹ thuật KStudy K0826:
 * - XML Sitemap Protocol 0.9 (https://www.sitemaps.org/schemas/sitemap/0.9)
 * - Clean URLs tuyệt đối (không lộ query parameters hay phần mở rộng .html)
 * - Canonical Domain: https://www.vusitien.click (luôn có www)
 * - Tần suất thay đổi (<changefreq>), Độ ưu tiên (<priority>), Thời gian sửa đổi (<lastmod>)
 * - Xuất file ra cả thư mục gốc và thư mục public/
 */

const fs = require('fs');
const path = require('path');
const dbService = require('../server/db');

const BASE_URL = process.env.SITE_URL || 'https://www.vusitien.click';

function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function generateSitemap() {
  console.log('[Sitemap Generator] Đang quét cơ sở dữ liệu và sinh Clean URLs...');

  const urls = [];
  const today = formatDate(new Date());

  // 1. CÁC TRANG CỐ ĐỊNH / TRANG TĨNH CỐT LÕI (CLEAN ROUTING)
  const staticPages = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/thu-vien`, priority: '0.9', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/blog`, priority: '0.9', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/pricing.html`, priority: '0.8', changefreq: 'weekly', lastmod: today },
    { loc: `${BASE_URL}/privacy.html`, priority: '0.3', changefreq: 'yearly', lastmod: '2026-01-01' },
    { loc: `${BASE_URL}/terms.html`, priority: '0.3', changefreq: 'yearly', lastmod: '2026-01-01' }
  ];

  urls.push(...staticPages);

  // 2. CÁC TÁC PHẨM / SÁCH TRIẾT HỌC KINH ĐIỂN (CLEAN URL: /kinh-dien/:bookId)
  let books = [];
  try {
    books = dbService.getAllBooks ? dbService.getAllBooks() : [];
  } catch (err) {
    console.warn('[Sitemap Generator] Không thể đọc danh sách sách từ DB:', err.message);
  }

  books.forEach(book => {
    if (book.status && book.status !== 'published') return;
    const bookUrl = `${BASE_URL}/kinh-dien/${encodeURIComponent(book.id)}`;
    urls.push({
      loc: bookUrl,
      lastmod: formatDate(book.updated_at || book.created_at),
      changefreq: 'weekly',
      priority: '0.9'
    });
  });

  // 3. CÁC TRIẾT GIA (CLEAN URL: /triet-gia/:philosopherId)
  let philosophers = [];
  try {
    philosophers = dbService.getAllPhilosophers ? dbService.getAllPhilosophers() : [];
  } catch (err) {
    console.warn('[Sitemap Generator] Không thể đọc danh sách triết gia từ DB:', err.message);
  }

  philosophers.forEach(phil => {
    const philUrl = `${BASE_URL}/triet-gia/${encodeURIComponent(phil.id)}`;
    urls.push({
      loc: philUrl,
      lastmod: formatDate(phil.updated_at || new Date()),
      changefreq: 'monthly',
      priority: '0.8'
    });
  });

  // 4. CÁC BÀI VIẾT BLOG / PHÂN TÍCH TRIẾT HỌC (CLEAN URL: /blog/:slug)
  let posts = [];
  try {
    posts = dbService.getAllBlogPosts ? dbService.getAllBlogPosts() : [];
  } catch (err) {
    console.warn('[Sitemap Generator] Không thể đọc danh sách blog từ DB:', err.message);
  }

  posts.forEach(post => {
    if (post.status && post.status.toUpperCase() !== 'PUBLISHED') return;
    const postUrl = `${BASE_URL}/blog/${encodeURIComponent(post.slug)}`;
    urls.push({
      loc: postUrl,
      lastmod: formatDate(post.updated_at || post.published_at || post.created_at),
      changefreq: 'weekly',
      priority: '0.8'
    });
  });

  // TẠO NỘI DUNG XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  urls.forEach(item => {
    xml += '  <url>\n';
    xml += `    <loc>${item.loc}</loc>\n`;
    xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  // GHI FILE VÀO ROOT VÀ PUBLIC
  const rootPath = path.join(__dirname, '..', 'sitemap.xml');
  const publicPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  fs.writeFileSync(rootPath, xml, 'utf8');
  console.log(`[Sitemap Generator] Đã xuất file sitemap.xml tại: ${rootPath} (${urls.length} URLs)`);

  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(publicPath, xml, 'utf8');
    console.log(`[Sitemap Generator] Đã xuất file sitemap.xml tại: ${publicPath}`);
  }

  return { total: urls.length, urls };
}

if (require.main === module) {
  try {
    const result = generateSitemap();
    console.log(`[Sitemap Generator] Hoàn thành xuất sắc! Đã lập chỉ mục ${result.total} Clean URLs.`);
  } catch (e) {
    console.error('[Sitemap Generator] Lỗi:', e);
    process.exit(1);
  }
}

module.exports = { generateSitemap };
