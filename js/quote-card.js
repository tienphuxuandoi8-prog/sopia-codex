/**
 * SOPHIA CODEX - QUOTE CARD GENERATOR (FACEBOOK FEED & STORY)
 * Bộ tạo thiệp danh ngôn nghệ thuật xuất ảnh PNG chuẩn 1080p cho:
 * 1. Facebook Feed (1:1 Vuông)
 * 2. Facebook Story / Tin (9:16 Dọc)
 * 100% Canvas thuần phía client, tải ảnh tức thì không cần cài thêm thư viện.
 */

class QuoteCardGenerator {
  constructor() {
    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.format = 'feed'; // 'feed' (1:1) hoặc 'story' (9:16)
    this.theme = 'navy';  // 'navy', 'parchment', 'jade'
    
    this.quoteText = "Không phải sự vật làm ta phiền lòng, mà chính cách ta nhìn nhận chúng.";
    this.authorName = "Marcus Aurelius";
    this.bookTitle = "Suy Tưởng (Meditations)";

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.modal = document.getElementById('quote-card-modal');
      this.canvas = document.getElementById('quote-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }

      this.bindEvents();
    });
  }

  bindEvents() {
    // Đóng modal
    document.getElementById('quote-modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('quote-modal-backdrop')?.addEventListener('click', () => this.close());

    // Nút chuyển định dạng Feed / Story
    document.querySelectorAll('.quote-format-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fmt = btn.getAttribute('data-format');
        this.setFormat(fmt);
      });
    });

    // Nút chọn tông màu
    document.querySelectorAll('.quote-theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const thm = btn.getAttribute('data-theme');
        this.setTheme(thm);
      });
    });

    // Nhập liệu trực tiếp từ textarea
    const quoteInput = document.getElementById('quote-input-text');
    quoteInput?.addEventListener('input', (e) => {
      this.quoteText = e.target.value;
      this.render();
    });

    // Nút tải ảnh
    document.getElementById('quote-download-btn')?.addEventListener('click', () => this.downloadPNG());

    // Nút sao chép văn bản
    document.getElementById('quote-copy-text-btn')?.addEventListener('click', () => this.copyToClipboard());
  }

  open(text, author = "", book = "") {
    if (text) this.quoteText = text.trim();
    if (author) this.authorName = author.trim();
    if (book) this.bookTitle = book.trim();

    const quoteInput = document.getElementById('quote-input-text');
    if (quoteInput) quoteInput.value = this.quoteText;

    const authorInput = document.getElementById('quote-input-author');
    if (authorInput) authorInput.textContent = `${this.authorName} • ${this.bookTitle}`;

    if (this.modal) {
      this.modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    if (document.fonts) {
      document.fonts.ready.then(() => this.render());
    } else {
      this.render();
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  setFormat(fmt) {
    this.format = fmt;
    document.querySelectorAll('.quote-format-btn').forEach(btn => {
      if (btn.getAttribute('data-format') === fmt) {
        btn.classList.add('bg-amber-500', 'text-stone-950', 'font-bold');
        btn.classList.remove('bg-stone-200', 'text-stone-700', 'bg-white/10', 'text-stone-300');
      } else {
        btn.classList.remove('bg-amber-500', 'text-stone-950', 'font-bold');
        btn.classList.add('bg-white/10', 'text-stone-300');
      }
    });
    this.render();
  }

  setTheme(thm) {
    this.theme = thm;
    document.querySelectorAll('.quote-theme-btn').forEach(btn => {
      if (btn.getAttribute('data-theme') === thm) {
        btn.classList.add('ring-2', 'ring-amber-400', 'scale-105');
      } else {
        btn.classList.remove('ring-2', 'ring-amber-400', 'scale-105');
      }
    });
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;

    // Kích thước xuất độ phân giải cao (High-Res 1080p)
    let width = 1080;
    let height = this.format === 'story' ? 1920 : 1080;

    this.canvas.width = width;
    this.canvas.height = height;

    const ctx = this.ctx;

    // 1. Phối màu theo chủ đề
    let bgColor = "#0E1B15";
    let bgGradientEnd = "#070E0B";
    let goldColor = "#D4AF37";
    let textColor = "#FBF7EE";
    let subTextColor = "#D8C7A5";
    let watermarkColor = "#8C7345";

    if (this.theme === 'parchment') {
      bgColor = "#F8F4EB";
      bgGradientEnd = "#EFE8D8";
      goldColor = "#B8860B";
      textColor = "#1F2622";
      subTextColor = "#5C5242";
      watermarkColor = "#8A7960";
    } else if (this.theme === 'jade') {
      bgColor = "#0D261B";
      bgGradientEnd = "#06130D";
      goldColor = "#48CAE4";
      textColor = "#F0FDF4";
      subTextColor = "#BBEFDF";
      watermarkColor = "#39806A";
    }

    // Nền chuyển sắc tinh tế
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, bgGradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Khung viền chỉ vàng hoàng gia (Ornate Double Gold Border)
    const margin = this.format === 'story' ? 80 : 60;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);
    ctx.setLineDash([]);

    // Họa tiết góc cổ điển
    const cornerSize = 40;
    this.drawCorner(ctx, margin, margin, cornerSize, goldColor, 0);
    this.drawCorner(ctx, width - margin, margin, cornerSize, goldColor, Math.PI / 2);
    this.drawCorner(ctx, width - margin, height - margin, cornerSize, goldColor, Math.PI);
    this.drawCorner(ctx, margin, height - margin, cornerSize, goldColor, -Math.PI / 2);

    // 3. Logo & Nhãn nhận diện trên cùng
    ctx.textAlign = "center";
    ctx.font = "bold 20px 'Cinzel', serif";
    ctx.fillStyle = goldColor;
    ctx.letterSpacing = "6px";
    const headerY = this.format === 'story' ? 220 : 150;
    ctx.fillText("S O P H I A   C O D E X", width / 2, headerY);

    ctx.font = "italic 16px 'Lora', serif";
    ctx.fillStyle = subTextColor;
    ctx.letterSpacing = "2px";
    ctx.fillText("Thư Viện Triết Học & Chiêm Nghiệm Toàn Cầu", width / 2, headerY + 36);

    // Dấu mở ngoặc kép nghệ thuật “
    ctx.font = "italic 110px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = goldColor;
    ctx.globalAlpha = 0.45;
    const quoteMarkY = this.format === 'story' ? 440 : 280;
    ctx.fillText("“", width / 2, quoteMarkY);
    ctx.globalAlpha = 1.0;

    // 4. Nội dung Danh Ngôn / Trích đoạn
    ctx.font = "500 38px 'Lora', Georgia, serif";
    ctx.fillStyle = textColor;
    ctx.letterSpacing = "0px";

    const maxLineWidth = width - margin * 4;
    const lines = this.wrapText(ctx, this.quoteText, maxLineWidth);
    
    const lineHeight = 64;
    const totalTextHeight = lines.length * lineHeight;
    let startY = (height / 2) - (totalTextHeight / 2) + (this.format === 'story' ? -60 : -10);

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + (idx * lineHeight));
    });

    // Đường kẻ phân cách vàng
    const divY = startY + totalTextHeight + 40;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, divY);
    ctx.lineTo(width / 2 + 120, divY);
    ctx.stroke();

    ctx.fillStyle = goldColor;
    ctx.beginPath();
    ctx.arc(width / 2, divY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 5. Tên Tác Giả & Tác Phẩm
    ctx.font = "bold 26px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = goldColor;
    ctx.letterSpacing = "1.5px";
    ctx.fillText(this.authorName.toUpperCase(), width / 2, divY + 54);

    ctx.font = "italic 22px 'Lora', Georgia, serif";
    ctx.fillStyle = subTextColor;
    ctx.fillText(this.bookTitle, width / 2, divY + 92);

    // 6. Watermark chân trang kêu gọi ghé thăm
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillStyle = watermarkColor;
    ctx.letterSpacing = "1px";
    const footerY = height - margin - 35;
    ctx.fillText("📖 Đọc trọn vẹn tại: sophiacodex.vn • 100% Miễn phí & Toàn văn", width / 2, footerY);

    // Cập nhật preview hình ảnh
    const previewImg = document.getElementById('quote-preview-image');
    if (previewImg) {
      previewImg.src = this.canvas.toDataURL('image/png');
    }
  }

  drawCorner(ctx, x, y, size, color, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(8, 8);
    ctx.lineTo(28, 8);
    ctx.stroke();

    ctx.fillRect(10, 10, 5, 5);
    ctx.restore();
  }

  wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const paragraphs = text.split('\n');
    const allLines = [];

    for (const para of paragraphs) {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          allLines.push(currentLine);
          currentLine = word;
        }
      }
      allLines.push(currentLine);
    }
    return allLines.length > 0 ? allLines : [''];
  }

  downloadPNG() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    const safeTitle = this.bookTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `sophia-codex-quote-${this.format}-${safeTitle}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();

    // Đồng bộ tăng lượt chia sẻ thiệp vào cơ sở dữ liệu SQLite
    fetch('/api/quotes/1/share', { method: 'POST' }).catch(() => {});

    if (window.readerEngine) {
      window.readerEngine.showToast("Đã tải ảnh thiệp danh ngôn chuẩn 1080p!");
    }
  }

  copyToClipboard() {
    const shareText = `"${this.quoteText}"\n— ${this.authorName} (${this.bookTitle})\n\nĐọc sách triết học toàn văn tại: https://sophiacodex.vn #SophiaCodex #TrietHoc #ChiaSeTriThuc`;
    navigator.clipboard.writeText(shareText).then(() => {
      fetch('/api/quotes/1/share', { method: 'POST' }).catch(() => {});
      if (window.readerEngine) {
        window.readerEngine.showToast("Đã sao chép trích dẫn & liên kết bài đọc!");
      }
    });
  }
}

// Khởi tạo đối tượng toàn cục
window.quoteGenerator = new QuoteCardGenerator();
window.quoteCardGen = window.quoteGenerator;
