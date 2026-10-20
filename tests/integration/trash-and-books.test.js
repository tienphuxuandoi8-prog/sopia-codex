import { describe, it, expect, beforeEach } from 'vitest';
const dbService = require('../../server/db');

describe('Quản trị Tác phẩm, Chương & Cơ chế Thùng Rác (30 Ngày)', () => {
  const testBookId = 'test-sach-triet-hoc-' + Date.now();
  let createdBook = null;

  it('1. Tạo sách mới an toàn, tạo slug chuẩn tiếng Việt và không bị lỗi trùng lặp', () => {
    createdBook = dbService.createBook({
      id: testBookId,
      title: 'Tác Phẩm Thử Nghiệm Triết Học',
      original_title: 'Philosophical Test Book',
      author: 'Triết Gia Thử Nghiệm',
      category: 'stoicism',
      school: 'Chủ nghĩa Khắc Kỷ',
      summary: 'Tóm tắt tác phẩm thử nghiệm'
    });

    expect(createdBook).toBeDefined();
    expect(createdBook.id).toBe(testBookId);
    expect(createdBook.title).toBe('Tác Phẩm Thử Nghiệm Triết Học');

    // Thử tạo một sách khác trùng tiêu đề để kiểm tra khả năng tự sinh slug hậu tố
    const dupBook = dbService.createBook({
      title: 'Tác Phẩm Thử Nghiệm Triết Học',
      author: 'Tác Giả Khác'
    });
    expect(dupBook).toBeDefined();
    expect(dupBook.id).not.toBe(createdBook.id);
    expect(dupBook.id.startsWith('tac-pham-thu-nghiem-triet-hoc')).toBe(true);

    // Dọn dẹp dupBook
    dbService.deleteBook(dupBook.id, true);
  });

  it('2. Cập nhật và đổi tên sách thành công mà không làm gãy dữ liệu', () => {
    const updated = dbService.updateBook(testBookId, {
      title: 'Tác Phẩm Thử Nghiệm (Đã Đổi Tên)',
      tagline: 'Lời tựa mới cập nhật',
      summary: 'Tóm tắt nội dung được chỉnh sửa thành công.'
    });

    expect(updated).toBeDefined();
    expect(updated.title).toBe('Tác Phẩm Thử Nghiệm (Đã Đổi Tên)');
    expect(updated.tagline).toBe('Lời tựa mới cập nhật');
  });

  it('3. Thêm nội dung chương thủ công và smart ingest thành công', () => {
    // 3.1 Thêm chương thủ công
    const chapId = dbService.createChapter({
      book_id: testBookId,
      chapter_number: 'Chương 1',
      title: 'Khởi đầu của sự tỉnh thức',
      paragraphs: ['Đoạn văn 1 của chương.', 'Đoạn văn 2 của chương.'],
      takeaways: [{ title: 'Bài học 1', desc: 'Mô tả bài học 1' }]
    });

    expect(chapId).toBeDefined();
    const chap = dbService.getChapterById(chapId);
    expect(chap).toBeDefined();
    expect(chap.title).toBe('Khởi đầu của sự tỉnh thức');

    // 3.2 Smart Ingest
    const rawText = `
Chương 2: Làm chủ tâm trí
Đây là đoạn 1 của chương hai.
Đây là đoạn 2 của chương hai.

Chương 3: Tự do và trách nhiệm
Nội dung của chương thứ ba ở đây.
    `;
    const ingestRes = dbService.smartIngestChapters(testBookId, rawText);
    expect(ingestRes.success).toBe(true);
    expect(ingestRes.totalParsed).toBe(2);

    const allChaps = dbService.getChaptersByBook(testBookId);
    expect(allChaps.length).toBe(3);
  });

  it('4. Cơ chế Soft Delete: Xóa sách sẽ chuyển vào Thùng Rác (bảo lưu 30 ngày)', () => {
    const delRes = dbService.deleteBook(testBookId, false);
    expect(delRes.success).toBe(true);
    expect(delRes.permanent).toBe(false);

    // Kiểm tra sách không còn trong danh sách công khai
    const activeBooks = dbService.getAllBooks();
    const found = activeBooks.find(b => b.id === testBookId);
    expect(found).toBeUndefined();

    // Nhưng sách vẫn nằm trong Thùng rác
    const trash = dbService.getTrashItems();
    const trashedBook = trash.books.find(b => b.id === testBookId);
    expect(trashedBook).toBeDefined();
    expect(trashedBook.days_remaining).toBeGreaterThanOrEqual(29);
    expect(trashedBook.days_remaining).toBeLessThanOrEqual(30);
  });

  it('5. Khôi phục sách từ Thùng Rác thành công trước 30 ngày', () => {
    const restoreRes = dbService.restoreBook(testBookId);
    expect(restoreRes.success).toBe(true);

    // Sách đã quay trở lại danh sách công khai
    const activeBooks = dbService.getAllBooks();
    const found = activeBooks.find(b => b.id === testBookId);
    expect(found).toBeDefined();
    expect(found.title).toBe('Tác Phẩm Thử Nghiệm (Đã Đổi Tên)');

    // Các chương cũng được khôi phục
    const chaps = dbService.getChaptersByBook(testBookId);
    expect(chaps.length).toBe(3);
  });

  it('6. Thử nghiệm Xóa chương vào Thùng Rác và Khôi phục', () => {
    const chaps = dbService.getChaptersByBook(testBookId);
    const firstChap = chaps[0];

    // Chuyển chương vào thùng rác
    const delChapRes = dbService.deleteChapter(firstChap.id, false);
    expect(delChapRes.success).toBe(true);

    const activeChaps = dbService.getChaptersByBook(testBookId);
    expect(activeChaps.length).toBe(2);

    // Khôi phục chương
    const restoreChapRes = dbService.restoreChapter(firstChap.id);
    expect(restoreChapRes.success).toBe(true);

    const restoredChaps = dbService.getChaptersByBook(testBookId);
    expect(restoredChaps.length).toBe(3);

    // Dọn dẹp dữ liệu test vĩnh viễn
    dbService.deleteBook(testBookId, true);
  });
});
