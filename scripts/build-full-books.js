/**
 * SOPHIA CODEX - BỘ TẠO DỮ LIỆU ĐẦY ĐỦ 100% CÁC CHƯƠNG SÁCH (FULL 112 CHƯƠNG)
 * Tự động hợp nhất 112 chương toàn văn vào data.js & đồng bộ hóa toàn bộ thư mục public, client, server.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const BOOKS_DATA_DIR = path.join(ROOT_DIR, 'js', 'books-data');

function extractChapters(filename, varName) {
  const filePath = path.join(BOOKS_DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy file: ${filePath}`);
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const m = code.match(new RegExp(`window\\.${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`));
  if (!m) throw new Error(`Không thể trích xuất ${varName} từ ${filename}`);
  return JSON.parse(m[1]);
}

const suyTuongChapters = extractChapters('suy-tuong.js', 'SUY_TUONG_FULL_CHAPTERS');
const congHoaChapters = extractChapters('cong-hoa.js', 'CONG_HOA_FULL_CHAPTERS');
const zarathustraChapters = extractChapters('zarathustra.js', 'ZARATHUSTRA_FULL_CHAPTERS');
const banVeTuDoChapters = extractChapters('ban-ve-tu-do.js', 'BAN_VE_TU_DO_FULL_CHAPTERS');
const daoDucKinhChapters = extractChapters('dao-duc-kinh.js', 'DAO_DUC_KINH_FULL_CHAPTERS');

console.log(`[BUILD] Đã nạp dữ liệu chương:`);
console.log(`  - Suy Tưởng: ${suyTuongChapters.length} quyển`);
console.log(`  - Cộng Hòa: ${congHoaChapters.length} quyển`);
console.log(`  - Zarathustra: ${zarathustraChapters.length} phần`);
console.log(`  - Bàn Về Tự Do: ${banVeTuDoChapters.length} chương`);
console.log(`  - Đạo Đức Kinh: ${daoDucKinhChapters.length} chương`);

const totalChapters = suyTuongChapters.length + congHoaChapters.length + zarathustraChapters.length + banVeTuDoChapters.length + daoDucKinhChapters.length;
console.log(`  => TỔNG CỘNG: ${totalChapters} CHƯƠNG TOÀN VĂN.`);

const fullPhilosophyData = {
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
      color: "from-amber-950 to-stone-900"
    },
    {
      id: "nietzsche",
      name: "Friedrich Nietzsche",
      title: "Triết gia Ý chí Quyền lực",
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
      id: "suy-tuong",
      title: "Suy Tưởng (Meditations)",
      originalTitle: "Τὰ εἰς ἑαυτόν",
      author: "Marcus Aurelius",
      authorRole: "Hoàng đế Triết gia La Mã",
      school: "Chủ nghĩa Khắc Kỷ (Stoicism)",
      category: "stoicism",
      readTime: "95 phút",
      audioDuration: "3 giờ 45 phút",
      year: "170 – 180 SCN",
      rating: 4.95,
      readersCount: "28,450",
      featured: true,
      tagline: "Toàn văn trọn vẹn 12 Quyển suy tư rèn luyện nội tâm của Marcus Aurelius",
      coverImage: "assets/covers/suy-tuong.svg",
      fallbackCover: "assets/covers/suy-tuong.svg",
      bgmTheme: "Giai điệu Đàn Hạc Thư Phòng & Sa Trường",
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #0F2318 0%, #06100B 100%)",
        accent: "#C59B4B",
        textColor: "#FFFFFF",
        badge: "Tuyệt Tác Khắc Kỷ • Toàn Văn"
      },
      summary: "Cuốn sách ghi chép chân thực nhất của Marcus Aurelius gửi gắm cho chính bản thân mình giữa sa trường và bệnh tật hiểm nghèo. Tác phẩm dạy nghệ thuật làm chủ tâm trí, phân biệt những gì thuộc quyền kiểm soát và những gì nằm ngoài, đạt được sự an tĩnh nội tại tối thượng.",
      chapters: suyTuongChapters
    },
    {
      id: "cong-hoa",
      title: "Cộng Hòa (The Republic)",
      originalTitle: "Πολιτεία",
      author: "Plato",
      authorRole: "Triết gia Cổ điển Athens",
      school: "Triết học Cổ điển Hy Lạp",
      category: "classical",
      readTime: "120 phút",
      audioDuration: "4 giờ 10 phút",
      year: "375 TCN",
      rating: 4.88,
      readersCount: "34,200",
      featured: false,
      tagline: "Toàn văn trọn bộ 10 Quyển về Quốc gia lý tưởng, Công lý & Dụ ngôn Hang Động",
      coverImage: "assets/covers/cong-hoa.svg",
      fallbackCover: "assets/covers/cong-hoa.svg",
      bgmTheme: "Giai điệu Đàn Lia Hy Lạp Cổ",
      studioAudioUrl: "https://cdn.freesound.org/previews/588/588234_11861866-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #131E2E 0%, #080D14 100%)",
        accent: "#64B5F6",
        textColor: "#FFFFFF",
        badge: "Nền Tảng Văn Minh • Toàn Văn"
      },
      summary: "Tác phẩm đối thoại kinh điển của Plato dưới lời dẫn của Socrates, khảo sát bản chất của Công lý trong linh hồn con người và cấu trúc của một quốc gia lý tưởng. Đỉnh cao của tác phẩm là Dụ ngôn Hang Động — ẩn dụ bất hủ về giải phóng con người khỏi xiềng xích của định kiến để bước ra ánh sáng chân lý.",
      chapters: congHoaChapters
    },
    {
      id: "dao-duc-kinh",
      title: "Đạo Đức Kinh (Tao Te Ching)",
      originalTitle: "道德經",
      author: "Lão Tử",
      authorRole: "Khai tổ Đạo Gia Phương Đông",
      school: "Triết học Phương Đông",
      category: "eastern",
      readTime: "75 phút",
      audioDuration: "2 giờ 30 phút",
      year: "Thế kỷ 6 TCN",
      rating: 4.98,
      readersCount: "45,800",
      featured: true,
      tagline: "Toàn văn trọn bộ 81 Chương (Thượng Kinh & Hạ Kinh) của Lão Tử",
      coverImage: "assets/covers/dao-duc-kinh.svg",
      fallbackCover: "assets/covers/dao-duc-kinh.svg",
      bgmTheme: "Tiếng Đàn Tranh & Tiếng Suối Chảy",
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #241A0E 0%, #0E0A05 100%)",
        accent: "#E5A93C",
        textColor: "#FFFFFF",
        badge: "Minh Triết Đông Phương • Toàn Văn"
      },
      summary: "Kinh điển triết học phương Đông gồm 81 chương hàm súc vi diệu. Đạo Đức Kinh mở ra con đường sống hòa hợp tuyệt đối với tự nhiên ('Vô vi nhi vô bất vi'), dạy con người bản lĩnh khiêm hạ như nước, nhu thắng cương, lấy tĩnh chế động.",
      chapters: daoDucKinhChapters
    },
    {
      id: "zarathustra",
      title: "Zarathustra Đã Nói Như Thế",
      originalTitle: "Also sprach Zarathustra",
      author: "Friedrich Nietzsche",
      authorRole: "Triết gia Văn hóa & Hiện sinh",
      school: "Chủ nghĩa Hiện sinh",
      category: "existentialism",
      readTime: "110 phút",
      audioDuration: "3 giờ 50 phút",
      year: "1883 – 1885",
      rating: 4.91,
      readersCount: "22,100",
      featured: false,
      tagline: "Toàn văn trọn bộ 4 Phần di sản triết học Hiện sinh của Nietzsche",
      coverImage: "assets/covers/zarathustra.svg",
      fallbackCover: "assets/covers/zarathustra.svg",
      bgmTheme: "Âm Hưởng Giao Hưởng Hùng Tráng",
      studioAudioUrl: "https://cdn.freesound.org/previews/588/588234_11861866-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #240E14 0%, #0E0507 100%)",
        accent: "#E57373",
        textColor: "#FFFFFF",
        badge: "Khúc Ca Ý Chí • Toàn Văn"
      },
      summary: "Kiệt tác văn chương và triết học đỉnh cao của Nietzsche. Qua nhân vật tiên tri Zarathustra, ông công bố sự sụp đổ của các thần tượng cũ, kêu gọi con người vượt thoát khỏi sự tầm thường để vươn tới hình mẫu Übermensch bằng Ý chí Quyền lực và tình yêu số phận (Amor Fati).",
      chapters: zarathustraChapters
    },
    {
      id: "ban-ve-tu-do",
      title: "Bàn Về Tự Do (On Liberty)",
      originalTitle: "On Liberty",
      author: "John Stuart Mill",
      authorRole: "Nhà tư tưởng Tự do & Khai Sáng",
      school: "Thời kỳ Khai Sáng",
      category: "enlightenment",
      readTime: "85 phút",
      audioDuration: "2 giờ 45 phút",
      year: "1859",
      rating: 4.86,
      readersCount: "19,800",
      featured: false,
      tagline: "Toàn văn trọn bộ 5 Chương luận thuyết Tự do cá nhân của J.S. Mill",
      coverImage: "assets/covers/ban-ve-tu-do.svg",
      fallbackCover: "assets/covers/ban-ve-tu-do.svg",
      bgmTheme: "Nhạc Thính Phòng Khai Sáng",
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #15222E 0%, #080E14 100%)",
        accent: "#E2B659",
        textColor: "#FFFFFF",
        badge: "Khai Minh Nhân Loại • Toàn Văn"
      },
      summary: "Tác phẩm đặt ra nguyên lý tối thượng về quyền tự do cá nhân: Xã hội chỉ có quyền can thiệp vào tự do của một người nhằm mục đích duy nhất là tự vệ, ngăn chặn điều gây hại cho người khác. Tự do tư tưởng, tự do thảo luận và tranh biện là điều kiện tiên quyết cho sự tiến bộ và phẩm giá của nền văn minh nhân loại.",
      chapters: banVeTuDoChapters
    }
  ],

  dailyQuotes: [
    {
      quote: "Hạnh phúc của cuộc đời không phụ thuộc vào những gì xảy đến với bạn, mà vào cách bạn lựa chọn phản ứng với chúng.",
      author: "Epictetus",
      school: "Chủ nghĩa Khắc Kỷ",
      context: "Lời răn dạy của người thầy nô lệ La Mã về quyền tự do nội tâm tối thượng."
    },
    {
      quote: "Người chinh phục được người khác là người có sức mạnh; người chinh phục được chính mình mới là kẻ vô địch.",
      author: "Lão Tử",
      school: "Đạo Gia",
      context: "Chương 33 Đạo Đức Kinh về việc thắng được bản ngã tư lợi."
    },
    {
      quote: "Kẻ nào có một lý do 'Tại sao' để sống, kẻ đó có thể chịu đựng hầu hết mọi 'Như thế nào'.",
      author: "Friedrich Nietzsche",
      school: "Chủ nghĩa Hiện sinh",
      context: "Tư tưởng nền tảng giúp con người tìm thấy ý nghĩa sống giữa nghịch cảnh cùng cực."
    },
    {
      quote: "Sự bình yên thực sự không nằm ở một vùng quê xa xôi hay bãi biển thanh vắng, mà ẩn sâu trong sự tĩnh lặng của một tâm trí có trật tự.",
      author: "Marcus Aurelius",
      school: "Khắc Kỷ La Mã",
      context: "Suy Tưởng Quyển IV về chốn lui về ẩn náu bên trong tâm hồn."
    }
  ],

  aiKnowledge: {
    systemPrompt: `Bạn là Hiền Triết AI (Socrates & Stoic Companion) của nền tảng Sophia Codex. Bạn nói tiếng Việt tao nhã, sâu sắc, hòa nhã, chuẩn mực của một học giả triết học uyên bác. Bạn hỗ trợ người đọc bằng phương pháp gợi mở Socrates (Socratic dialogue): giải thích các khái niệm triết học khó hiểu, tóm lược luận điểm và khơi gợi tư duy phản biện.`,
    presets: {
      "tom-tat": "Dưới góc nhìn của Sophia Codex, tác phẩm này xoay quanh 3 luận điểm trụ cột:\n1. **Quyền năng nội tâm**: Bạn không thể điều khiển nghịch cảnh bên ngoài, nhưng có toàn quyền điều khiển cách phản ứng của tâm trí.\n2. **Sự hòa hợp với tự nhiên**: Chấp nhận dòng chảy của thời gian và sinh tử với tâm thế ung dung (*Amor Fati*).\n3. **Trách nhiệm với cộng đồng**: Con người sinh ra để tương trợ lẫn nhau, làm điều thiện xuất phát từ chính bổn phận chứ không vì danh vọng.",
      "amor-fati": "**Amor Fati** (Yêu số phận) là khái niệm được triết gia Khắc Kỷ và sau này là Nietzsche đề cao:\nNó không phải là sự buông xuôi thụ động (cam chịu), mà là thái độ nhiệt thành đón nhận mọi biến cố—dù là vinh quang hay trắc trở—như một chất liệu quý giá tôi luyện bản lĩnh và vẻ đẹp của tâm hồn bạn.",
      "phan-bien": "Hãy để tôi đặt cho bạn một câu hỏi gợi mở:\n*Nếu bạn cho rằng tâm trí có thể hoàn toàn bình thản trước mọi mất mát, thì cảm xúc đau buồn tự nhiên khi mất đi người thân yêu có phải là một sự 'yếu đuối' hay chính là bằng chứng thiêng liêng của nhân tính? Bạn sẽ dung hòa giữa lý trí Khắc Kỷ và trái tim con người như thế nào?*"
    }
  }
};

const fullCode = `/**
 * SOPHIA CODEX - PHILOSOPHY DATABASE (BẢN TOÀN VĂN ĐẦY ĐỦ 100% - 112 CHƯƠNG)
 * Sách triết học kinh điển toàn văn, đầy đủ các chương mục dịch thuật chuẩn xác,
 * âm thanh thu âm phòng thu (Studio Audio) và chân dung triết gia bảo tàng.
 */

const PHILOSOPHY_DATA = ${JSON.stringify(fullPhilosophyData, null, 2)};

if (typeof window !== 'undefined') {
  window.PHILOSOPHY_DATA = PHILOSOPHY_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PHILOSOPHY_DATA;
}
`;

// Ghi ra các file data.js cần thiết
const targetFiles = [
  path.join(ROOT_DIR, 'js', 'data.js'),
  path.join(ROOT_DIR, 'js', 'pages', 'data.js'),
  path.join(ROOT_DIR, 'public', 'js', 'pages', 'data.js'),
  path.join(ROOT_DIR, 'public', 'js', 'data.js')
];

targetFiles.forEach(targetFile => {
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetFile, fullCode, 'utf8');
  console.log(`✅ Đã cập nhật thành công: ${targetFile}`);
});

// Đồng bộ hóa thư mục books-data sang public/js/books-data
const publicBooksDir = path.join(ROOT_DIR, 'public', 'js', 'books-data');
if (!fs.existsSync(publicBooksDir)) {
  fs.mkdirSync(publicBooksDir, { recursive: true });
}
const bookFiles = fs.readdirSync(BOOKS_DATA_DIR);
bookFiles.forEach(file => {
  const src = path.join(BOOKS_DATA_DIR, file);
  const dest = path.join(publicBooksDir, file);
  fs.copyFileSync(src, dest);
  console.log(`📁 Đã sao chép: ${file} -> public/js/books-data/`);
});

console.log(`\n🎉 HOÀN TẤT CẬP NHẬT TOÀN BỘ 112 CHƯƠNG SÁCH CHO HỆ THỐNG!`);
