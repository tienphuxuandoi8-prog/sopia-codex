import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import dbService from '../../server/db.js';

describe('Blog & SEO / AI Engine Integration Tests', () => {
  let createdPost = null;

  beforeAll(() => {
    // Seed 1 bài viết mẫu chuẩn triết học
    createdPost = dbService.createBlogPost({
      title: 'Khắc Kỷ Trong Đời Sống Số: Nghệ Thuật Làm Chủ Tâm Trí',
      content: `## 1. Bản Lĩnh Của Người Khắc Kỷ\n\nTriết học Khắc kỷ dạy chúng ta phân biệt rõ ràng giữa hai miền:\n- Những gì nằm trong tầm kiểm soát của ta (suy nghĩ, phản ứng, hành động).\n- Những gì hoàn toàn nằm ngoài tầm kiểm soát của ta (dư luận, thuật toán, biến động kinh tế).\n\n> "Hạnh phúc của cuộc đời bạn phụ thuộc vào phẩm chất những suy nghĩ của bạn." — Marcus Aurelius\n\n## 2. Ứng Dụng Hàng Ngày\nKhi nhận được một tin tức gây lo âu trên mạng xã hội, hãy hít thở sâu và tự hỏi: *Liệu mình có thể can thiệp trực tiếp vào điều này không?* Nếu không, hãy thanh thản buông bỏ sự bận tâm vô ích.`,
      summary: 'Khám phá cách rèn luyện tâm trí bình thản và bản lĩnh nội tâm trước sự bủa vây của thông tin mạng xã hội theo triết học Khắc kỷ.',
      category: 'Chủ nghĩa Khắc kỷ',
      tags: 'khac-ky, stoicism, triet-hoc, marcus-aurelius',
      status: 'PUBLISHED',
      author: 'Sophia Codex',
      faq_json: [
        {
          q: 'Khắc kỷ có phải là kìm nén cảm xúc không?',
          a: 'Không. Khắc kỷ là nhận biết cảm xúc và làm chủ phản ứng của bản thân, chứ không phải chai sạn hay vô cảm.'
        }
      ]
    });
  });

  afterAll(() => {
    if (createdPost && createdPost.id) {
      dbService.deleteBlogPost(createdPost.id);
    }
  });

  it('GET /blog should return HTTP 200 with list of blog posts in HTML', async () => {
    const res = await request(app).get('/blog');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Blog Minh Triết');
    expect(res.text).toContain(createdPost.title);
  });

  it('GET /blog/:slug should return SSR HTML with OpenGraph and JSON-LD schema', async () => {
    const res = await request(app).get(`/blog/${createdPost.slug}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain(createdPost.title);
    expect(res.text).toContain('application/ld+json');
    expect(res.text).toContain('BlogPosting');
    expect(res.text).toContain('BreadcrumbList');
    expect(res.text).toContain('FAQPage');
    expect(res.text).toContain('Marcus Aurelius');
  });

  it('GET /sitemap.xml should return valid XML containing the blog post URL', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    expect(res.text).toContain(`/blog/${createdPost.slug}`);
  });

  it('GET /robots.txt should allow AI Crawlers (GPTBot, PerplexityBot, ClaudeBot)', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.text).toContain('User-agent: GPTBot');
    expect(res.text).toContain('User-agent: PerplexityBot');
    expect(res.text).toContain('User-agent: ClaudeBot');
    expect(res.text).toContain('/llms.txt');
  });

  it('GET /llms.txt should return structured markdown for AI summary', async () => {
    const res = await request(app).get('/llms.txt');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain(createdPost.title);
    expect(res.text).toContain(createdPost.category);
  });

  it('GET /api/posts should return JSON list of published posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(p => p.id === createdPost.id);
    expect(found).toBeDefined();
    expect(found.slug).toBe(createdPost.slug);
  });
});
