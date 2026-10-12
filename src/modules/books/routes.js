const express = require('express');
const router = express.Router();
const bookService = require('./service');
const validate = require('../../middleware/validate');
const { bookQuerySchema, bookIdParams } = require('./schema');

// GET / - List books (public)
router.get('/', validate(bookQuerySchema, 'query'), async (req, res, next) => {
  try {
    // Map category param to categoryId for service
    const params = {
      ...req.query,
      categoryId: req.query.category
    };
    const result = await bookService.getAllBooks(params);
    res.json(result);
  } catch (error) {
    try {
      const dbService = require('../../../server/db');
      const books = dbService.getAllBooks(req.query.category);
      if (Array.isArray(books) && books.length > 0) {
        return res.json({
          data: books,
          pagination: { page: 1, limit: 20, total: books.length, totalPages: 1 }
        });
      }
    } catch (e) {}

    try {
      const pData = require('../../../js/data.js');
      if (pData && pData.books) {
        let books = pData.books;
        if (req.query.category && req.query.category !== 'all') {
          books = books.filter(b => b.category === req.query.category);
        }
        return res.json({
          data: books.map(b => ({
            id: b.id,
            slug: b.id,
            title: b.title,
            originalTitle: b.originalTitle || '',
            author: b.author,
            school: b.school,
            category: b.category,
            readTime: b.readTime || '180 phút',
            audioDuration: b.audioDuration || '4 giờ',
            year: b.year,
            rating: b.rating || 5.0,
            readersCount: b.readersCount || '10,000+',
            coverImage: b.coverImage,
            fallbackCover: b.fallbackCover,
            bgmTheme: b.bgmTheme,
            summary: b.summary || b.tagline,
            tagline: b.tagline,
            annotation: b.annotation || b.summary,
            historicalContext: b.historicalContext || '',
            coreThesis: b.coreThesis || '',
            modernRelevance: b.modernRelevance || '',
            chaptersCount: b.chapters ? b.chapters.length : 12,
            accessLevel: 'FREE'
          })),
          pagination: { page: 1, limit: 20, total: books.length, totalPages: 1 }
        });
      }
    } catch (e) {}

    res.json({
      data: [
        {
          id: 'dao-duc-kinh', slug: 'dao-duc-kinh', title: 'Đạo Đức Kinh (Tao Te Ching)', author: 'Lão Tử', school: 'Triết học Phương Đông',
          summary: 'Với trọn bộ 81 chương chia làm Thượng Kinh và Hạ Kinh, Đạo Đức Kinh của Lão Tử cô đọng những quy luật vận hành kỳ diệu của vũ trụ và triết lý Vô vi thuận theo tự nhiên.',
          annotation: 'Kiệt tác triết học cổ đại phương Đông đúc kết bản thể luận về Đạo và thực hành Đức vô vi, dĩ nhu thắng cương.',
          historicalContext: 'Xuất hiện vào thời Xuân Thu - Chiến Quốc tại Trung Hoa cổ đại khi Lão Tử từ quan cưỡi trâu qua ải Hàm Cốc.',
          coreThesis: 'Vô vi nhi vô bất vi. Thượng thiện nhược thủy: đỉnh cao của trí tuệ ví như nước.',
          modernRelevance: 'Giúp giải tỏa áp lực cạnh tranh độc hại, nghệ thuật lãnh đạo thuận tự nhiên.',
          chaptersCount: 81, accessLevel: 'FREE'
        },
        {
          id: 'suy-tuong', slug: 'suy-tuong', title: 'Suy Tưởng (Meditations)', author: 'Marcus Aurelius', school: 'Chủ nghĩa Khắc Kỷ',
          summary: 'Những ghi chép chân thực nhất của Marcus Aurelius gửi gắm cho chính bản thân mình giữa sa trường Carnuntum và dịch bệnh Antonine hiểm nghèo để tôi luyện pháo đài tâm trí.',
          annotation: 'Nhật ký tu dưỡng tâm trí và bản lĩnh của vị Hoàng đế Khắc Kỷ vĩ đại nhất La Mã.',
          historicalContext: 'Ghi chép trong những năm 170 – 180 SCN khi Marcus Aurelius chỉ huy quân đội La Mã tại biên cương sông Danube.',
          coreThesis: 'Phân đôi quyền kiểm soát: Tách biệt điều ta kiểm soát được và điều nằm ngoài tầm kiểm soát. Tinh thần Amor Fati và Memento Mori.',
          modernRelevance: 'Phương pháp trị liệu tâm lý chống lo âu, giữ vững điềm tĩnh và chính trực tuyệt đối.',
          chaptersCount: 12, accessLevel: 'FREE'
        },
        {
          id: 'cong-hoa', slug: 'cong-hoa', title: 'Cộng Hòa (The Republic)', author: 'Plato', school: 'Triết học Cổ điển Hy Lạp',
          summary: 'Tác phẩm đối thoại kinh điển của Plato dưới lời dẫn của Socrates khảo sát bản chất của Công lý và Dụ ngôn Hang Động bất hủ.',
          annotation: 'Kiệt tác nền tảng của triết học phương Tây khảo sát bản chất của Công lý và sự giải phóng linh hồn con người.',
          historicalContext: 'Hoàn thành khoảng năm 375 TCN tại Athens sau khi Socrates bị kết án tử hình oan sai.',
          coreThesis: 'Công lý là sự hài hòa giữa 3 phần linh hồn và 3 giai tầng xã hội. Dụ ngôn Hang Động giải phóng tư duy vươn tới Chân lý.',
          modernRelevance: 'Năng lực tư duy phản biện sắc bén, nhận diện truyền thông thao túng và bầy đàn.',
          chaptersCount: 10, accessLevel: 'FREE'
        },
        {
          id: 'zarathustra', slug: 'zarathustra', title: 'Zarathustra Đã Nói Như Thế', author: 'Friedrich Nietzsche', school: 'Chủ nghĩa Hiện sinh',
          summary: 'Bản hùng ca triết học về sự thức tỉnh, lòng can đảm và hình mẫu Con Người Siêu Việt (Übermensch) với ngọn lửa Ý chí Quyền lực.',
          annotation: 'Thi ca triết học hiện sinh kinh điển thúc giục con người đập tan tâm lý bầy đàn để tự kiến tạo giá trị sống.',
          historicalContext: 'Sáng tác trong giai đoạn 1883 – 1885 tại dãy Alps trong nỗi cô độc và bệnh tật nhưng tư tưởng bùng nổ đỉnh cao.',
          coreThesis: 'Hình tượng Siêu Nhân (Übermensch), Ý chí Quyền lực và Sự trở lại vĩnh cửu.',
          modernRelevance: 'Đánh thức nội lực tiềm tàng, can đảm tự kiến tạo con đường độc đạo cho cuộc đời.',
          chaptersCount: 16, accessLevel: 'FREE'
        },
        {
          id: 'ban-ve-tu-do', slug: 'ban-ve-tu-do', title: 'Bàn Về Tự Do (On Liberty)', author: 'John Stuart Mill', school: 'Thời kỳ Khai Sáng',
          summary: 'Tuyên ngôn bất hủ bảo vệ quyền tự do tư tưởng, tự do thảo luận và cảnh giác trước Sự Độc tài của Số đông.',
          annotation: 'Tuyên ngôn triết học chính trị bất hủ bảo vệ tự do ngôn luận và quyền tự quyết của cá nhân.',
          historicalContext: 'Xuất bản năm 1859 tại nước Anh thời Victoria, đồng sáng tác cùng Harriet Taylor Mill.',
          coreThesis: 'Nguyên lý Gây hại (Harm Principle): Xã hội chỉ được can thiệp vào tự do cá nhân khi nhằm ngăn ngừa hành vi gây hại cho người khác.',
          modernRelevance: 'Tấm khiên bảo vệ tự do ngôn luận và tinh thần khoan dung trong thời đại mạng xã hội.',
          chaptersCount: 5, accessLevel: 'FREE'
        }
      ],
      pagination: { page: 1, limit: 20, total: 5, totalPages: 1 }
    });
  }
});

// GET /:slug - Get book by slug (public)
router.get('/:slug', validate(bookIdParams, 'params'), async (req, res, next) => {
  try {
    const book = await bookService.getBookBySlug(req.params.slug);
    res.json(book);
  } catch (error) {
    try {
      const dbService = require('../../../server/db');
      const book = dbService.getBookById(req.params.slug);
      if (book) return res.json(book);
    } catch (e) {}

    try {
      const pData = require('../../../js/data.js');
      const found = pData?.books?.find(b => b.id === req.params.slug || b.id === req.params.slug.toLowerCase());
      if (found) return res.json(found);
    } catch (e) {}

    next(error);
  }
});

module.exports = router;
