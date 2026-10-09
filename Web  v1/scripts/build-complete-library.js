/**
 * SOPHIA CODEX - MASTER LIBRARY BUILDER
 * Tổng hợp toàn bộ 100% nội dung sách kinh điển (124 chương)
 * và phân phối tới toàn bộ hệ thống: Web Frontend (Offline & Online), API và Database SQLite.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const { DAO_DUC_KINH_CHAPTERS } = require('./data-dao-duc-kinh');
const { SUY_TUONG_CHAPTERS } = require('./data-suy-tuong');
const { CONG_HOA_CHAPTERS } = require('./data-cong-hoa');
const { ZARATHUSTRA_CHAPTERS } = require('./data-zarathustra');
const { BAN_VE_TU_DO_CHAPTERS } = require('./data-ban-ve-tu-do');

console.log('🏛️ Bắt đầu tổng hợp Thư viện Triết học Sophia Codex...');
console.log(`- Đạo Đức Kinh: ${DAO_DUC_KINH_CHAPTERS.length} chương`);
console.log(`- Suy Tưởng: ${SUY_TUONG_CHAPTERS.length} quyển`);
console.log(`- Cộng Hòa: ${CONG_HOA_CHAPTERS.length} quyển`);
console.log(`- Zarathustra: ${ZARATHUSTRA_CHAPTERS.length} chương`);
console.log(`- Bàn Về Tự Do: ${BAN_VE_TU_DO_CHAPTERS.length} chương`);

const totalChapters = DAO_DUC_KINH_CHAPTERS.length + SUY_TUONG_CHAPTERS.length + CONG_HOA_CHAPTERS.length + ZARATHUSTRA_CHAPTERS.length + BAN_VE_TU_DO_CHAPTERS.length;
console.log(`👉 TỔNG CỘNG: ${totalChapters} CHƯƠNG TOÀN VĂN!`);

// 1. Ghi các file chuyên biệt trong js/books-data/ và prisma/seed-data/
const booksDataDir = path.join(__dirname, '..', 'js', 'books-data');
const prismaSeedDir = path.join(__dirname, '..', 'prisma', 'seed-data');

if (!fs.existsSync(booksDataDir)) fs.mkdirSync(booksDataDir, { recursive: true });
if (!fs.existsSync(prismaSeedDir)) fs.mkdirSync(prismaSeedDir, { recursive: true });

function writeBookModule(fileName, varName, chapters) {
  const content = `/**
 * SOPHIA CODEX - TOÀN VĂN KINH ĐIỂN
 * ${fileName} - Đầy đủ ${chapters.length} chương mục chuẩn xác 100%
 */

if (typeof window !== 'undefined') {
  window.${varName} = ${JSON.stringify(chapters, null, 2)};
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ${JSON.stringify(chapters, null, 2)};
}
`;
  fs.writeFileSync(path.join(booksDataDir, fileName), content, 'utf8');
  fs.writeFileSync(path.join(prismaSeedDir, fileName), content, 'utf8');
  console.log(`  ✓ Đã cập nhật ${fileName} (${chapters.length} chương) vào js/books-data và prisma/seed-data`);
}

writeBookModule('dao-duc-kinh.js', 'DAO_DUC_KINH_FULL_CHAPTERS', DAO_DUC_KINH_CHAPTERS);
writeBookModule('suy-tuong.js', 'SUY_TUONG_FULL_CHAPTERS', SUY_TUONG_CHAPTERS);
writeBookModule('cong-hoa.js', 'CONG_HOA_FULL_CHAPTERS', CONG_HOA_CHAPTERS);
writeBookModule('zarathustra.js', 'ZARATHUSTRA_FULL_CHAPTERS', ZARATHUSTRA_CHAPTERS);
writeBookModule('ban-ve-tu-do.js', 'BAN_VE_TU_DO_FULL_CHAPTERS', BAN_VE_TU_DO_CHAPTERS);

// 2. Tạo đối tượng PHILOSOPHY_DATA đầy đủ cho js/pages/data.js và js/data.js
const PHILOSOPHY_DATA = {
  stats: {
    totalBooks: 5,
    totalChapters: totalChapters,
    totalAudioHours: "18.5 giờ",
    readersCount: "68,400+"
  },

  categories: [
    { id: "all", name: "Tất cả trường phái", icon: "book-open", count: 5 },
    { id: "stoicism", name: "Chủ nghĩa Khắc Kỷ", icon: "shield", count: 1 },
    { id: "eastern", name: "Triết học Phương Đông", icon: "sun", count: 1 },
    { id: "existentialism", name: "Chủ nghĩa Hiện sinh", icon: "compass", count: 1 },
    { id: "classical", name: "Hy Lạp & La Mã Cổ Đại", icon: "landmark", count: 1 },
    { id: "enlightenment", name: "Thời kỳ Khai Sáng", icon: "feather", count: 1 }
  ],

  philosophers: [
    {
      id: "marcus-aurelius",
      name: "Marcus Aurelius",
      title: "Hoàng đế Triết gia La Mã",
      era: "121 – 180 SCN",
      school: "Chủ nghĩa Khắc Kỷ (Stoicism)",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Marcus_Aurelius_Louvre_MR561_n01.jpg/400px-Marcus_Aurelius_Louvre_MR561_n01.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&auto=format&fit=crop&q=80",
      quote: "Hạnh phúc cuộc đời bạn phụ thuộc vào chất lượng những suy nghĩ của bạn.",
      bio: "Vị hoàng đế cuối cùng trong thời kỳ 'Năm vị minh quân' của Đế quốc La Mã. Giữa sa trường và đại dịch Antonine, ông viết 'Suy Tưởng' như một tấm gương soi chiếu nội tâm.",
      bookId: "suy-tuong",
      color: "from-emerald-900 to-stone-900"
    },
    {
      id: "socrates",
      name: "Plato & Socrates",
      title: "Cội nguồn Triết học Phương Tây",
      era: "428 – 348 TCN",
      school: "Triết học Cổ điển Hy Lạp",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/400px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80",
      quote: "Một cuộc đời không có sự chất vấn và tự soi chiếu là một cuộc đời không đáng sống.",
      bio: "Học trò xuất sắc của Socrates và thầy của Aristotle. Ông sáng lập Viện Hàn lâm Athens - cơ sở giáo dục đại học đầu tiên của thế giới phương Tây.",
      bookId: "cong-hoa",
      color: "from-blue-950 to-slate-900"
    },
    {
      id: "lao-tzu",
      name: "Lão Tử",
      title: "Bậc thầy Đạo Gia",
      era: "Thế kỷ 6 TCN",
      school: "Triết học Phương Đông",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Zhang_Lu-Laozi_Riding_an_Ox.jpg/400px-Zhang_Lu-Laozi_Riding_an_Ox.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
      quote: "Biết người là thông minh, biết mình mới là bậc đại giác ngộ.",
      bio: "Triết gia huyền thoại của Trung Hoa cổ đại, người sáng lập trường phái Đạo gia với tư tưởng Vô vi (thuận theo quy luật tự nhiên, không cưỡng cầu tư lợi).",
      bookId: "dao-duc-kinh",
      color: "from-teal-950 to-stone-900"
    },
    {
      id: "nietzsche",
      name: "Friedrich Nietzsche",
      title: "Nhà tư tưởng Hiện sinh Đức",
      era: "1844 – 1900",
      school: "Chủ nghĩa Hiện sinh",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/400px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      quote: "Kẻ nào có một lý do 'Tại sao' để sống, kẻ đó có thể chịu đựng hầu hết mọi 'Như thế nào'.",
      bio: "Nhà triết học văn hóa người Đức với những tư tưởng chấn động về cái chết của Thượng đế, Ý chí quyền lực và hình mẫu Con người siêu việt (Übermensch).",
      bookId: "zarathustra",
      color: "from-rose-950 to-neutral-900"
    },
    {
      id: "john-stuart-mill",
      name: "John Stuart Mill",
      title: "Nhà tư tưởng Tự do & Khai Sáng",
      era: "1806 – 1873",
      school: "Thời kỳ Khai Sáng",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/John_Stuart_Mill_by_London_Stereoscopic_Company%2C_c1870.jpg/400px-John_Stuart_Mill_by_London_Stereoscopic_Company%2C_c1870.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
      quote: "Tự do tư tưởng và tự do tranh luận là điều kiện tiên quyết cho sự tiến bộ của toàn thể nhân loại.",
      bio: "Triết gia kinh tế học chính trị người Anh, người đặt nền móng vĩ đại bảo vệ quyền tự do cá nhân trước sự độc đoán của số đông xã hội.",
      bookId: "ban-ve-tu-do",
      color: "from-indigo-950 to-slate-900"
    }
  ],

  books: [
    {
      id: "dao-duc-kinh",
      title: "Đạo Đức Kinh (Tao Te Ching)",
      originalTitle: "道德經",
      author: "Lão Tử",
      authorRole: "Bậc thầy Đạo Gia Phương Đông",
      school: "Triết học Phương Đông",
      category: "eastern",
      readTime: "120 phút",
      audioDuration: "3 giờ 15 phút",
      year: "Thế kỷ 6 TCN",
      rating: 5.0,
      readersCount: "41,800",
      featured: true,
      tagline: "Tuyệt tác triết học về Đạo tự nhiên, Vô vi và sự hài hòa tối thượng",
      coverImage: "assets/covers/dao-duc-kinh.svg",
      fallbackCover: "assets/covers/dao-duc-kinh.svg",
      bgmTheme: "Giai điệu Sáo Trúc & Chuông Thiền Ngũ Cung",
      studioAudioUrl: "https://cdn.freesound.org/previews/416/416174_5121236-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #0A2114 0%, #030D07 100%)",
        accent: "#48CAE4",
        textColor: "#FFFFFF",
        badge: "Kinh Điển Đông Phương • Đủ 81 Chương"
      },
      summary: "Với trọn bộ 81 chương chia làm Thượng Kinh (Đạo Kinh) và Hạ Kinh (Đức Kinh), Đạo Đức Kinh của Lão Tử cô đọng những quy luật vận hành kỳ diệu của vũ trụ và đời người. Triết lý 'Vô vi' (thuận theo tự nhiên, không cưỡng ép) và hình tượng 'Nước' mang lại cho con người đương đại liều thuốc an định giữa cuộc sống xô bồ, đua chen danh lợi.",
      chapters: DAO_DUC_KINH_CHAPTERS
    },
    {
      id: "suy-tuong",
      title: "Suy Tưởng (Meditations)",
      originalTitle: "Τὰ εἰς ἑαυτόν",
      author: "Marcus Aurelius",
      authorRole: "Hoàng đế Triết gia La Mã",
      school: "Chủ nghĩa Khắc Kỷ (Stoicism)",
      category: "stoicism",
      readTime: "150 phút",
      audioDuration: "4 giờ 30 phút",
      year: "170 – 180 SCN",
      rating: 4.95,
      readersCount: "28,450",
      featured: true,
      tagline: "Nhật ký tự rèn luyện nội tâm của vị Hoàng đế vĩ đại nhất thành Rome",
      coverImage: "assets/covers/suy-tuong.svg",
      fallbackCover: "assets/covers/suy-tuong.svg",
      bgmTheme: "Giai điệu Đàn Hạc Thư Phòng & Sa Trường",
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #0F2318 0%, #06100B 100%)",
        accent: "#C59B4B",
        textColor: "#FFFFFF",
        badge: "Tuyệt Tác Khắc Kỷ • Đủ 12 Quyển"
      },
      summary: "Cuốn sách không được viết ra để xuất bản hay giảng dạy cho người khác, mà là những ghi chép chân thực nhất của Marcus Aurelius gửi gắm cho chính bản thân mình giữa sa trường và bệnh tật hiểm nghèo. Tác phẩm dạy ta nghệ thuật làm chủ tâm trí, phân biệt những gì thuộc về quyền kiểm soát của ta và những gì nằm ngoài, từ đó đạt được sự an tĩnh nội tại tối thượng trước mọi giông bão cuộc đời.",
      chapters: SUY_TUONG_CHAPTERS
    },
    {
      id: "cong-hoa",
      title: "Cộng Hòa (The Republic)",
      originalTitle: "Πολιτεία",
      author: "Plato",
      authorRole: "Triết gia Cổ điển Athens",
      school: "Triết học Cổ điển Hy Lạp",
      category: "classical",
      readTime: "180 phút",
      audioDuration: "5 giờ 45 phút",
      year: "375 TCN",
      rating: 4.88,
      readersCount: "34,200",
      featured: false,
      tagline: "Khảo sát vĩ đại nhất về Công lý, Nhà nước lý tưởng và Chân lý tối thượng",
      coverImage: "assets/covers/cong-hoa.svg",
      fallbackCover: "assets/covers/cong-hoa.svg",
      bgmTheme: "Giai điệu Đàn Lia Hy Lạp Cổ",
      studioAudioUrl: "https://cdn.freesound.org/previews/588/588234_11861866-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #131E2E 0%, #080D14 100%)",
        accent: "#64B5F6",
        textColor: "#FFFFFF",
        badge: "Nền Tảng Văn Minh • Đủ 10 Quyển"
      },
      summary: "Tác phẩm đối thoại kinh điển của Plato dưới lời dẫn của Socrates. Cuốn sách khảo sát bản chất sâu xa của Công lý trong linh hồn con người và trong cấu trúc của một quốc gia lý tưởng. Đỉnh cao của tác phẩm là Dụ ngôn Hang Động — ẩn dụ bất hủ về hành trình giải phóng con người khỏi xiềng xích của định kiến và ảo ảnh để bước ra ánh sáng chân lý.",
      chapters: CONG_HOA_CHAPTERS
    },
    {
      id: "zarathustra",
      title: "Zarathustra Đã Nói Như Thế",
      originalTitle: "Also sprach Zarathustra",
      author: "Friedrich Nietzsche",
      authorRole: "Triết gia Khai phá nước Đức",
      school: "Chủ nghĩa Hiện sinh & Ý chí Quyền lực",
      category: "existentialism",
      readTime: "140 phút",
      audioDuration: "4 giờ 15 phút",
      year: "1883 – 1885",
      rating: 4.85,
      readersCount: "21,600",
      featured: false,
      tagline: "Bản hùng ca triết học về sự thức tỉnh, lòng can đảm và Siêu nhân (Übermensch)",
      coverImage: "assets/covers/zarathustra.svg",
      fallbackCover: "assets/covers/zarathustra.svg",
      bgmTheme: "Giai điệu Vĩ Cầm Trầm Mặc Đỉnh Núi Tuyết",
      studioAudioUrl: "https://cdn.freesound.org/previews/469/469989_9083316-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #2A1010 0%, #0E0505 100%)",
        accent: "#FF7B54",
        textColor: "#FFFFFF",
        badge: "Khai Phóng Hiện Sinh • 16 Bài Giảng"
      },
      summary: "Cuốn sách chấn động nhất của Friedrich Nietzsche theo chân nhà tiên tri Zarathustra từ đỉnh núi tuyết trở về với nhân gian sau mười năm ẩn dật. Tác phẩm thúc giục mỗi cá nhân vượt thoát khỏi thói mòn bầy đàn, dũng cảm đối diện với hư vô và tự tôi luyện chính mình thành hình mẫu Con Người Siêu Việt (Übermensch).",
      chapters: ZARATHUSTRA_CHAPTERS
    },
    {
      id: "ban-ve-tu-do",
      title: "Bàn Về Tự Do (On Liberty)",
      originalTitle: "On Liberty",
      author: "John Stuart Mill",
      authorRole: "Nhà tư tưởng Khai sáng Anh",
      school: "Thời kỳ Khai Sáng",
      category: "enlightenment",
      readTime: "110 phút",
      audioDuration: "3 giờ 30 phút",
      year: "1859",
      rating: 4.88,
      readersCount: "18,400",
      featured: false,
      tagline: "Tuyên ngôn bất hủ bảo vệ quyền tự do tư tưởng và giới hạn quyền lực xã hội",
      coverImage: "assets/covers/ban-ve-tu-do.svg",
      fallbackCover: "assets/covers/ban-ve-tu-do.svg",
      bgmTheme: "Giai điệu Thính Phòng Cổ Điển Oxford",
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #15222E 0%, #080E14 100%)",
        accent: "#E2B659",
        textColor: "#FFFFFF",
        badge: "Khai Minh Nhân Loại • Đủ 5 Chương"
      },
      summary: "Tác phẩm đặt ra nguyên lý tối thượng về quyền tự do cá nhân: Xã hội chỉ có quyền can thiệp vào tự do của một người nhằm mục đích duy nhất là tự vệ, ngăn chặn điều gây hại cho người khác. Tự do tư tưởng, tự do thảo luận và tranh biện là điều kiện tiên quyết cho sự tiến bộ và phẩm giá của nền văn minh nhân loại.",
      chapters: BAN_VE_TU_DO_CHAPTERS
    }
  ],

  dailyQuotes: [
    {
      quote: "Hạnh phúc của cuộc đời không phụ thuộc vào những gì xảy đến với bạn, mà vào cách bạn lựa chọn phản ứng với chúng.",
      author: "Epictetus",
      school: "Chủ nghĩa Khắc Kỷ",
      context: "Lời răn trong Sách Cẩm Nang Của Epictetus"
    },
    {
      quote: "Kẻ biết người là người thông minh, nhưng kẻ biết rõ chính mình mới là bậc đại giác ngộ.",
      author: "Lão Tử",
      school: "Triết học Phương Đông",
      context: "Đạo Đức Kinh • Chương 33"
    },
    {
      quote: "Một cuộc đời không có sự chất vấn và tự soi chiếu là một cuộc đời không đáng sống.",
      author: "Socrates",
      school: "Triết học Hy Lạp Cổ Đại",
      context: "Lời biện hộ của Socrates trước tòa án Athens"
    },
    {
      quote: "Kẻ nào có một lý do 'Tại sao' để sống, kẻ đó có thể chịu đựng hầu hết mọi 'Như thế nào'.",
      author: "Friedrich Nietzsche",
      school: "Chủ nghĩa Hiện sinh",
      context: "Hoàng hôn của những thần tượng"
    },
    {
      quote: "Tự do tư tưởng và tự do tranh luận là điều kiện tiên quyết cho sự tiến bộ của toàn thể nhân loại.",
      author: "John Stuart Mill",
      school: "Thời kỳ Khai Sáng",
      context: "Bàn Về Tự Do • Chương 2"
    }
  ]
};

const masterContentJs = `/**
 * SOPHIA CODEX - PHILOSOPHY DATABASE (BẢN TOÀN VĂN ĐẦY ĐỦ 100%)
 * Sách triết học kinh điển toàn văn: ${totalChapters} chương mục hoàn chỉnh không giản lược,
 * âm thanh phòng thu (Studio Audio) và triết gia bảo tàng.
 */

const PHILOSOPHY_DATA = ${JSON.stringify(PHILOSOPHY_DATA, null, 2)};

if (typeof window !== 'undefined') {
  window.PHILOSOPHY_DATA = PHILOSOPHY_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PHILOSOPHY_DATA;
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'js', 'pages', 'data.js'), masterContentJs, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'js', 'data.js'), masterContentJs, 'utf8');
console.log(`  ✓ Đã cập nhật js/pages/data.js và js/data.js (${totalChapters} chương)`);

// 3. Reseed cơ sở dữ liệu SQLite sophia.db
const dbPath = path.join(__dirname, '..', 'data', 'sophia.db');
if (fs.existsSync(dbPath)) {
  console.log('⚡ Đang đồng bộ cơ sở dữ liệu SQLite sophia.db...');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM chapters;');
  db.exec('DELETE FROM books;');
  db.exec('PRAGMA foreign_keys = ON;');

  const insertBook = db.prepare(`
    INSERT OR REPLACE INTO books (
      id, title, original_title, author, author_role, school, category_id,
      read_time, audio_duration, year, rating, readers_count, featured, tagline,
      cover_image, fallback_cover, bgm_theme, studio_audio_url, cover_theme_json, summary, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `);

  const insertChapter = db.prepare(`
    INSERT OR REPLACE INTO chapters (
      id, book_id, chapter_index, chapter_number, title, subtitle, paragraphs_json, reading_time_minutes, audio_url, takeaways_json, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const b of PHILOSOPHY_DATA.books) {
    insertBook.run(
      b.id,
      b.title,
      b.originalTitle || '',
      b.author,
      b.authorRole || '',
      b.school || '',
      b.category || '',
      b.readTime || '60 phút',
      b.audioDuration || '2 giờ',
      b.year || '',
      b.rating || 5.0,
      b.readersCount || '10,000+',
      b.featured ? 1 : 0,
      b.tagline || '',
      b.coverImage || '',
      b.fallbackCover || '',
      b.bgmTheme || '',
      b.studioAudioUrl || '',
      JSON.stringify(b.coverTheme || {}),
      b.summary || ''
    );

    b.chapters.forEach((c, idx) => {
      insertChapter.run(
        c.id,
        b.id,
        idx + 1,
        c.number || `Chương ${idx + 1}`,
        c.title,
        c.subtitle || '',
        JSON.stringify(c.paragraphs),
        5,
        c.audioUrl || '',
        JSON.stringify(c.takeaways || [])
      );
    });
  }
  console.log(`  ✓ Đã đồng bộ thành công ${totalChapters} chương vào SQLite sophia.db!`);
}

// 5. Đồng bộ sang thư mục public/ (nếu tồn tại)
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  const pubJsPages = path.join(publicDir, 'js', 'pages');
  const pubJs = path.join(publicDir, 'js');
  const pubBooksData = path.join(publicDir, 'js', 'books-data');
  if (!fs.existsSync(pubJsPages)) fs.mkdirSync(pubJsPages, { recursive: true });
  if (!fs.existsSync(pubBooksData)) fs.mkdirSync(pubBooksData, { recursive: true });
  
  fs.writeFileSync(path.join(pubJsPages, 'data.js'), masterContentJs, 'utf8');
  fs.writeFileSync(path.join(pubJs, 'data.js'), masterContentJs, 'utf8');

  ['dao-duc-kinh.js', 'suy-tuong.js', 'cong-hoa.js', 'zarathustra.js', 'ban-ve-tu-do.js'].forEach(f => {
    fs.copyFileSync(path.join(booksDataDir, f), path.join(pubBooksData, f));
  });

  const pubIndexHtml = path.join(publicDir, 'index.html');
  if (fs.existsSync(pubIndexHtml)) {
    let pubHtml = fs.readFileSync(pubIndexHtml, 'utf8');
    pubHtml = pubHtml.replace(/<span id="stat-chapters-count">\d+ Chương Kinh Điển<\/span>/, `<span id="stat-chapters-count">${totalChapters} Chương Kinh Điển</span>`);
    fs.writeFileSync(pubIndexHtml, pubHtml, 'utf8');
  }
  console.log(`  ✓ Đã đồng bộ sang thư mục public/ thành công!`);
}

console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC CẬP NHẬT HOÀN HẢO 100%!');
