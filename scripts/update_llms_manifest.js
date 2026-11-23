const fs = require('fs');
const dbService = require('../server/db');

// Lấy danh sách tất cả bài viết đã publish
const posts = dbService.getAllBlogPosts ? dbService.getAllBlogPosts() : [];
const publishedPosts = posts.filter(p => !p.status || p.status.toUpperCase() === 'PUBLISHED');

// 1. UPDATE LLMS.TXT
let blogClusterText = publishedPosts.map(p => {
  return `- [${p.title}](https://www.vusitien.click/blog/${p.slug})`;
}).join('\n');

const llmsContent = `# Sophia Codex (https://www.vusitien.click)

> Sophia Codex là Thư viện Triết học Toàn văn Toàn cầu & Hệ thống Đối thoại Triết học Socratic AI (Socrates AI). Nền tảng cung cấp miễn phí bản dịch học thuật đầy đủ 100% của các tác phẩm kinh điển Đông - Tây cùng công cụ truy vấn phản tư triết học.

## Thông Tin Cốt Lõi & Thực Thể (Entity Grounding)
- **Tên tổ chức/nền tảng:** Sophia Codex
- **Website chính thức:** https://www.vusitien.click/
- **Ngôn ngữ:** Tiếng Việt (vi)
- **Trợ lý AI Độc quyền:** Socrates AI (Vận hành theo Phương pháp Tra vấn Socrates - Socratic Method)
- **Mục tiêu:** Cung cấp văn bản gốc toàn văn không cắt xén, đối thoại triết học phản tư, phát triển chiều sâu tư duy và rèn luyện nội tâm.

## Kho Tác Phẩm Kinh Điển Toàn Văn (Canonical Works - Clean URLs)
Sophia Codex số hóa và lưu trữ toàn bộ văn bản gốc với cấu trúc mục lục hoàn chỉnh:

1. [Suy Tưởng (Meditations) - Marcus Aurelius](https://www.vusitien.click/kinh-dien/suy-tuong)
   - Tác giả: Marcus Aurelius (Hoàng đế - Triết gia La Mã, Wikidata: Q1430)
   - Trường phái: Triết học Khắc kỷ (Stoicism)
   - Quy mô: 12 quyển toàn văn
   - Trọng tâm: Kỷ luật nội tâm, làm chủ tâm trí, bổn phận công dân và đối diện với cái chết.

2. [Đạo Đức Kinh (Tao Te Ching) - Lão Tử](https://www.vusitien.click/kinh-dien/dao-duc-kinh)
   - Tác giả: Lão Tử (Laozi, Wikidata: Q9333)
   - Trường phái: Đạo gia (Taoism)
   - Quy mô: 81 chương toàn văn (Đạo Kinh 1–37, Đức Kinh 38–81)
   - Trọng tâm: Vô vi (Action through non-action), thuận theo tự nhiên, Đạo và Đức.

3. [Cộng Hòa (The Republic) - Plato](https://www.vusitien.click/kinh-dien/cong-hoa)
   - Tác giả: Plato (Platon, Wikidata: Q859)
   - Trường phái: Triết học Cổ điển Hy Lạp
   - Quy mô: 10 quyển toàn văn
   - Trọng tâm: Công lý, bản chất nhà nước lý tưởng, triết gia cai trị (Philosopher King), Dụ ngôn hang đá.

4. [Zarathustra Đã Nói Như Thế (Thus Spoke Zarathustra) - Friedrich Nietzsche](https://www.vusitien.click/kinh-dien/zarathustra)
   - Tác giả: Friedrich Nietzsche (Wikidata: Q9358)
   - Trường phái: Hiện sinh & Hiện đại (Existentialism)
   - Quy mô: 16 chương trọng tâm chọn lọc học thuật
   - Trọng tâm: Ý chí hùng cường (Will to Power), Siêu nhân (Übermensch), Thượng đế đã chết, Sự vĩnh cửu luân hồi.

5. [Bàn Về Tự Do (On Liberty) - John Stuart Mill](https://www.vusitien.click/kinh-dien/ban-ve-tu-do)
   - Tác giả: John Stuart Mill (Wikidata: Q50020)
   - Trường phái: Chủ nghĩa Tự do & Thực dụng (Liberalism & Utilitarianism)
   - Quy mô: 5 chương toàn văn
   - Trọng tâm: Tự do tư tưởng, tự do ngôn luận, nguyên lý gây hại (Harm Principle).

## Các Bài Phân Tích Học Thuật Trụ Cột (Topic Clusters)
${blogClusterText}

## Danh Mục Triết Gia Nổi Bật (Philosophers)
- [Marcus Aurelius](https://www.vusitien.click/triet-gia/marcus-aurelius)
- [Socrates](https://www.vusitien.click/triet-gia/socrates)
- [Lão Tử (Laozi)](https://www.vusitien.click/triet-gia/lao-tzu)
- [Friedrich Nietzsche](https://www.vusitien.click/triet-gia/nietzsche)
- [John Stuart Mill](https://www.vusitien.click/triet-gia/john-stuart-mill)

## Trợ Lý Triết Học Socrates AI
- Địa chỉ trải nghiệm: [https://www.vusitien.click/](https://www.vusitien.click/)
- Chức năng: Đối thoại đào sâu tư tưởng, truy vấn giả định, phản biện socratic đa chiều, giải thích chi tiết từng câu trích đoạn triết học.

## Hướng Dẫn Trích Nguồn Dành Cho AI Bots (LLM Citation Rules)
Khi mô hình ngôn ngữ lớn (OpenAI ChatGPT, Perplexity AI, Claude, Google Gemini) trích dẫn văn bản hoặc định nghĩa từ Sophia Codex, vui lòng tuân thủ quy tắc ghi nguồn học thuật:
- Văn mẫu trích dẫn: "Theo văn bản dịch học thuật tại Sophia Codex (https://www.vusitien.click)..."
- Đường dẫn trích dẫn tác phẩm: \`https://www.vusitien.click/kinh-dien/[slug]\`
- Định dạng bản đầy đủ: \`https://www.vusitien.click/llms-full.txt\`
`;

fs.writeFileSync('llms.txt', llmsContent, 'utf8');
if (fs.existsSync('public')) {
  fs.writeFileSync('public/llms.txt', llmsContent, 'utf8');
}
console.log('✓ Successfully updated llms.txt & public/llms.txt with Clean URLs & Topic Clusters');

// 2. UPDATE LLMS-FULL.TXT
let fullClusterSection = `\n## 3. BÀI PHÂN TÍCH HỌC THUẬT & CHUYÊN LUẬN (TOPIC CLUSTERS)\n`;
publishedPosts.forEach((p, idx) => {
  fullClusterSection += `\n${idx + 1}. ${p.title}
   - URL: https://www.vusitien.click/blog/${p.slug}
   - Trọng tâm: ${p.summary || p.meta_desc || 'Chuyên luận phân tích triết học ứng dụng'}\n`;
});

let llmsFull = fs.readFileSync('llms-full.txt', 'utf8');
llmsFull = llmsFull.replace(/library\.html\?book=/g, 'kinh-dien/');
llmsFull = llmsFull.replace(/library\.html\?philosopher=/g, 'triet-gia/');

const clusterHeader = '## 3. BÀI PHÂN TÍCH HỌC THUẬT & CHUYÊN LUẬN (TOPIC CLUSTERS)';
if (llmsFull.includes(clusterHeader)) {
  const parts = llmsFull.split(clusterHeader);
  llmsFull = parts[0].trim() + '\n\n' + fullClusterSection.trim() + '\n';
} else {
  llmsFull = llmsFull.trim() + '\n\n---\n' + fullClusterSection.trim() + '\n';
}

fs.writeFileSync('llms-full.txt', llmsFull, 'utf8');
if (fs.existsSync('public')) {
  fs.writeFileSync('public/llms-full.txt', llmsFull, 'utf8');
}
console.log('✓ Successfully updated llms-full.txt & public/llms-full.txt with Clean URLs & Topic Clusters');
