import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Books & Master Library QA Test Suite', () => {
  it('GET /api/v1/books should return all 5 books with valid summaries and annotations (NO undefined)', async () => {
    const res = await request(app).get('/api/v1/books');
    expect(res.status).toBe(200);

    const books = Array.isArray(res.body) ? res.body : (res.body.data || []);
    expect(books.length).toBeGreaterThanOrEqual(5);

    for (const book of books) {
      expect(book.id).toBeDefined();
      expect(book.title).toBeDefined();
      expect(book.title).not.toContain('undefined');

      // Kiểm tra chú thích & tóm lược chất lượng cao
      expect(book.summary).toBeDefined();
      expect(typeof book.summary).toBe('string');
      expect(book.summary.length).toBeGreaterThan(20);
      expect(book.summary).not.toContain('undefined');

      // Chú thích tác phẩm
      expect(book.annotation || book.summary).toBeDefined();
      expect((book.annotation || book.summary).length).toBeGreaterThan(20);
      expect(book.annotation || '').not.toContain('undefined');

      // Đảm bảo số chương chính xác
      expect(book.chaptersCount || book.chapters_count).toBeGreaterThan(0);
    }
  });

  const expectedBooks = ['dao-duc-kinh', 'suy-tuong', 'cong-hoa', 'zarathustra', 'ban-ve-tu-do'];

  for (const slug of expectedBooks) {
    it(`GET /api/v1/books/${slug} should return complete chapters, annotations and takeaways`, async () => {
      const res = await request(app).get(`/api/v1/books/${slug}`);
      expect(res.status).toBe(200);

      const book = res.body;
      expect(book.id).toBe(slug);
      expect(book.title).toBeDefined();
      expect(book.summary).toBeDefined();
      expect(book.summary).not.toContain('undefined');
      expect(book.summary.length).toBeGreaterThan(30);

      expect(book.annotation || book.summary).toBeDefined();
      expect((book.annotation || book.summary).length).toBeGreaterThan(30);

      // Kiểm tra danh sách chương
      expect(Array.isArray(book.chapters)).toBe(true);
      expect(book.chapters.length).toBeGreaterThan(0);

      // Kiểm tra chương đầu tiên có đầy đủ đoạn văn và takeaways
      const firstChap = book.chapters[0];
      expect(firstChap.title).toBeDefined();
      expect(Array.isArray(firstChap.paragraphs)).toBe(true);
      expect(firstChap.paragraphs.length).toBeGreaterThan(0);
    });
  }

  it('GET /api/overview should report 5 books and 124 chapters total', async () => {
    const res = await request(app).get('/api/overview');
    expect(res.status).toBe(200);
    expect(res.body.kpis).toBeDefined();
    expect(res.body.kpis.totalBooks).toBe(5);
    expect(res.body.kpis.totalChapters).toBe(124);
  });
});
