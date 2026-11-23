import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

describe('SOPHIA-INTERNAL-LINK Quality Gate (SOP Audit)', () => {
  const dbPath = path.join(process.cwd(), 'data', 'sophia.db');
  const db = new DatabaseSync(dbPath);

  const posts = db.prepare("SELECT slug, title, content FROM blog_posts WHERE status = 'PUBLISHED'").all();

  const validRoutes = [
    '/',
    '/thu-vien',
    '/blog',
    '/pricing.html',
    '/privacy.html',
    '/terms.html',
    '/kinh-dien/suy-tuong',
    '/kinh-dien/dao-duc-kinh',
    '/kinh-dien/cong-hoa',
    '/kinh-dien/zarathustra',
    '/kinh-dien/ban-ve-tu-do',
    '/triet-gia/marcus-aurelius',
    '/triet-gia/lao-tzu',
    '/triet-gia/socrates',
    '/triet-gia/nietzsche',
    '/triet-gia/john-stuart-mill'
  ];
  posts.forEach(p => validRoutes.push('/blog/' + p.slug));

  it('nên có ít nhất 8 bài viết blog đang xuất bản', () => {
    expect(posts.length).toBeGreaterThanOrEqual(8);
  });

  posts.forEach(post => {
    describe(`Kiểm toán liên kết bài viết: "${post.title}"`, () => {
      const links = [...post.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
        .map(m => ({ text: m[1], url: m[2], words: m[1].trim().split(/\s+/).length }))
        .filter(l => !l.url.startsWith('#'));

      it('mọi anchor text không được dài quá 6 từ (Red Line 2: Thẩm mỹ Typography)', () => {
        links.forEach(l => {
          expect(
            l.words,
            `Anchor text quá dài (${l.words} từ): "${l.text}" trỏ tới ${l.url}`
          ).toBeLessThanOrEqual(6);
        });
      });

      it('mọi internal link phải trỏ tới URL hợp lệ (Không có link 404)', () => {
        links.forEach(l => {
          expect(
            validRoutes.includes(l.url),
            `URL không hợp lệ hoặc link vỡ: "${l.url}" trong bài "${post.slug}"`
          ).toBe(true);
        });
      });

      it('không được trùng lặp cùng một destination URL trong một bài viết', () => {
        const urls = links.map(l => l.url);
        const uniqueUrls = new Set(urls);
        expect(
          urls.length,
          `Phát hiện URL bị lặp lại trong bài "${post.slug}": ${urls.join(', ')}`
        ).toBe(uniqueUrls.size);
      });

      it('phải có ít nhất 1 liên kết tới Kiệt tác Toàn văn (Pillar Link)', () => {
        const hasPillar = links.some(l => l.url.startsWith('/kinh-dien/'));
        expect(hasPillar, `Bài "${post.slug}" thiếu liên kết /kinh-dien/`).toBe(true);
      });

      it('phải có ít nhất 1 liên kết tới Thực thể Triết gia (Entity Grounding Link)', () => {
        const hasEntity = links.some(l => l.url.startsWith('/triet-gia/'));
        expect(hasEntity, `Bài "${post.slug}" thiếu liên kết /triet-gia/`).toBe(true);
      });
    });
  });
});
