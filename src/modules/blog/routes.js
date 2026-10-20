const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const dbService = require('../../../server/db');

// Đọc template blog-detail.html và blog-list.html
const viewsDir = path.join(__dirname, '..', '..', '..', 'views');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 1. Trang danh sách bài viết /blog
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    const category = req.query.category || 'ALL';
    const search = req.query.q || '';

    const posts = dbService.getAllBlogPosts({
      status: 'PUBLISHED',
      category: category === 'ALL' ? null : category,
      limit,
      offset,
      search: search || null
    });

    // Lấy template danh sách blog
    const templatePath = path.join(viewsDir, 'blog-list.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Render danh sách bài viết dưới dạng HTML chuẩn SEO
    let cardsHtml = '';
    if (posts.length === 0) {
      cardsHtml = `
        <div class="col-span-full text-center py-16 bg-stone-100/60 dark:bg-emerald-950/30 rounded-2xl border border-stone-200 dark:border-emerald-800/60">
          <p class="text-stone-500 dark:text-stone-400 font-serif text-lg">Chưa có bài viết nào phù hợp.</p>
          <a href="/blog" class="inline-block mt-4 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">Quay lại tất cả bài viết &rarr;</a>
        </div>
      `;
    } else {
      cardsHtml = posts.map(post => {
        const coverImg = post.cover_image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop';
        const dateStr = new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `
          <article class="group bg-white dark:bg-emerald-950/40 rounded-2xl border border-stone-200 dark:border-emerald-800/60 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
            <a href="/blog/${escapeHtml(post.slug)}" class="block aspect-video overflow-hidden relative">
              <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
              <span class="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/80 backdrop-blur-md text-amber-300 rounded-full border border-amber-500/30">
                ${escapeHtml(post.category)}
              </span>
            </a>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mb-2.5">
                  <span>${dateStr}</span>
                  <span>•</span>
                  <span>${post.reading_time || 5} phút đọc</span>
                </div>
                <h2 class="font-heading font-bold text-lg md:text-xl text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-3">
                  <a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a>
                </h2>
                <p class="font-serif text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed mb-4">
                  ${escapeHtml(post.summary || '')}
                </p>
              </div>
              <div class="pt-4 border-t border-stone-100 dark:border-emerald-900/60 flex items-center justify-between">
                <span class="text-xs font-medium text-stone-500 dark:text-stone-400">Tác giả: <strong class="text-stone-700 dark:text-stone-200">${escapeHtml(post.author || 'Sophia Codex')}</strong></span>
                <a href="/blog/${escapeHtml(post.slug)}" class="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:translate-x-1 transition-transform">
                  Đọc tiếp &rarr;
                </a>
              </div>
            </div>
          </article>
        `;
      }).join('\n');
    }

    html = html.replace('<!-- BLOG_CARDS_PLACEHOLDER -->', cardsHtml);
    html = html.replace('{{SEARCH_VALUE}}', escapeHtml(search));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Lỗi khi render trang blog list:', err);
    res.status(500).send('Lỗi máy chủ khi tải danh sách blog');
  }
});

// 2. Trang chi tiết bài viết /blog/:slug (ĐẦY ĐỦ SEO & CHATGPT SCHEMA)
router.get('/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const post = dbService.getBlogPostBySlug(slug);

    if (!post || post.status === 'ARCHIVED') {
      return res.status(404).sendFile(path.join(__dirname, '..', '..', '..', 'public', '404.html'));
    }

    // Tăng lượt xem
    dbService.incrementPostViews(post.id);

    // Render Markdown nội dung sang HTML
    const contentHtml = marked.parse(post.content || '');

    // Tạo FAQ JSON-LD nếu có
    let faqList = [];
    try {
      if (post.faq_json) {
        faqList = JSON.parse(post.faq_json);
      }
    } catch(e) {}

    let faqHtml = '';
    let faqSchema = null;
    if (Array.isArray(faqList) && faqList.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqList.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      };

      faqHtml = `
        <div class="mt-12 p-6 md:p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 dark:bg-emerald-950/40 dark:border-emerald-800/60">
          <h3 class="font-heading font-bold text-xl text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
            <span>❓</span> Những câu hỏi thường gặp (FAQ)
          </h3>
          <div class="space-y-4">
            ${faqList.map(item => `
              <div class="p-4 rounded-xl bg-white dark:bg-emerald-950/70 border border-stone-200 dark:border-emerald-800/50">
                <h4 class="font-semibold text-stone-900 dark:text-stone-100 text-sm md:text-base mb-2">${escapeHtml(item.q)}</h4>
                <p class="font-serif text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${escapeHtml(item.a)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const canonicalUrl = `${protocol}://${host}/blog/${post.slug}`;
    const coverImage = post.cover_image || `${protocol}://${host}/assets/images/og-blog-default.jpg`;
    const publishDateIso = new Date(post.created_at).toISOString();
    const updateDateIso = new Date(post.updated_at || post.created_at).toISOString();

    // Dữ liệu có cấu trúc Schema.org Article
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.meta_title || post.title,
      "description": post.meta_desc || post.summary || "",
      "image": [coverImage],
      "datePublished": publishDateIso,
      "dateModified": updateDateIso,
      "author": {
        "@type": "Person",
        "name": post.author || "Sophia Codex"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Sophia Codex",
        "logo": {
          "@type": "ImageObject",
          "url": `${protocol}://${host}/assets/images/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": `${protocol}://${host}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog Minh Triết",
          "item": `${protocol}://${host}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": canonicalUrl
        }
      ]
    };

    const schemasHtml = `
      <script type="application/ld+json">
        ${JSON.stringify(articleSchema, null, 2)}
      </script>
      <script type="application/ld+json">
        ${JSON.stringify(breadcrumbSchema, null, 2)}
      </script>
      ${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema, null, 2)}</script>` : ''}
    `;

    // Đọc template blog-detail.html
    const templatePath = path.join(viewsDir, 'blog-detail.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Thay thế các biến động vào template
    const dateFormatted = new Date(post.created_at).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    html = html
      .replace(/{{PAGE_TITLE}}/g, escapeHtml(post.meta_title || post.title) + ' — Sophia Codex')
      .replace(/{{META_DESCRIPTION}}/g, escapeHtml(post.meta_desc || post.summary || ''))
      .replace(/{{CANONICAL_URL}}/g, canonicalUrl)
      .replace(/{{COVER_IMAGE}}/g, escapeHtml(coverImage))
      .replace(/{{POST_TITLE}}/g, escapeHtml(post.title))
      .replace(/{{POST_SUMMARY}}/g, escapeHtml(post.summary || ''))
      .replace(/{{POST_AUTHOR}}/g, escapeHtml(post.author || 'Sophia Codex'))
      .replace(/{{POST_DATE}}/g, dateFormatted)
      .replace(/{{POST_READING_TIME}}/g, String(post.reading_time || 5))
      .replace(/{{POST_CATEGORY}}/g, escapeHtml(post.category || 'Triết học'))
      .replace(/{{POST_VIEWS}}/g, String(post.views || 0))
      .replace('<!-- STRUCTURED_DATA_SCHEMA -->', schemasHtml)
      .replace('<!-- POST_CONTENT_HTML -->', contentHtml)
      .replace('<!-- FAQ_SECTION_HTML -->', faqHtml);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Lỗi khi render bài viết blog:', err);
    res.status(500).send('Lỗi máy chủ khi tải nội dung bài viết');
  }
});

module.exports = router;