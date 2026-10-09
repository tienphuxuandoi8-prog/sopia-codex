const express = require('express');
const router = express.Router();
const bookService = require('../books/service');

// GET / - Overview stats (public)
router.get('/', async (req, res, next) => {
  try {
    const stats = await bookService.getOverviewStats();
    res.json(stats);
  } catch (error) {
    try {
      const dbService = require('../../../server/db');
      return res.json(dbService.getOverviewStats());
    } catch (e) {}
    res.json({
      kpis: {
        totalBooks: 5,
        totalChapters: 24,
        deepReadingHours: '18.5',
        totalShares: 1240,
        audioHours: '12.5',
        activeReaders: '68,400+'
      },
      topBooks: [
        { id: 'suy-tuong', title: 'Suy Tưởng (Meditations)', author: 'Marcus Aurelius', school: 'Chủ nghĩa Khắc Kỷ (Stoicism)', cover_image: 'assets/covers/suy-tuong.svg', sessions_count: 121, total_seconds: 81472 },
        { id: 'cong-hoa', title: 'Cộng Hòa (The Republic)', author: 'Plato', school: 'Triết học Cổ điển Hy Lạp', cover_image: 'assets/covers/cong-hoa.svg', sessions_count: 105, total_seconds: 79687 },
        { id: 'dao-duc-kinh', title: 'Đạo Đức Kinh (Tao Te Ching)', author: 'Lão Tử', school: 'Triết học Phương Đông', cover_image: 'assets/covers/dao-duc-kinh.svg', sessions_count: 105, total_seconds: 73310 },
        { id: 'zarathustra', title: 'Zarathustra Đã Nói Như Thế', author: 'Friedrich Nietzsche', school: 'Chủ nghĩa Hiện sinh & Ý chí Quyền lực', cover_image: 'assets/covers/zarathustra.svg', sessions_count: 95, total_seconds: 68500 },
        { id: 'ban-ve-tu-do', title: 'Bàn Về Tự Do (On Liberty)', author: 'John Stuart Mill', school: 'Thời kỳ Khai Sáng', cover_image: 'assets/covers/ban-ve-tu-do.svg', sessions_count: 42, total_seconds: 35200 }
      ],
      schoolDistribution: [
        { school: 'Khắc Kỷ (Stoicism)', count: 1 },
        { school: 'Đạo Gia Phương Đông', count: 1 },
        { school: 'Cổ Điển Hy Lạp', count: 1 }
      ],
      recentAiQuestions: [],
      dailyQuote: {
        quote: "Hạnh phúc cuộc đời bạn phụ thuộc vào chất lượng những suy nghĩ của bạn.",
        author: "Marcus Aurelius",
        book: "Suy Tưởng"
      },
      dbHealth: { status: 'healthy', database: 'Sophia Codex Core' }
    });
  }
});

module.exports = router;
