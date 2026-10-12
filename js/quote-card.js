/**
 * SOPHIA CODEX - QUOTE CARD GENERATOR (FACEBOOK FEED & STORY)
 * Bộ tạo thiệp danh ngôn triết học xuất ảnh nghệ thuật chuẩn 1080p cho:
 * 1. Facebook Feed (1:1 Vuông 1080x1080)
 * 2. Facebook Story / Tin (9:16 Dọc 1080x1920)
 * 
 * ✨ ĐẶC TÍNH NGHỆ THUẬT & KỸ THUẬT:
 * - 100% Canvas thuần phía client, tải ảnh tức thì không phụ thuộc server.
 * - Khắc phục triệt để lỗi vỡ font tiếng Việt / nhảy dấu bằng Unicode NFC và Google Fonts Vietnamese Subset.
 * - Loại bỏ toàn bộ fallback Georgia gây lỗi dấu trên Windows; sử dụng Merriweather, Lora, Playfair Display, Be Vietnam Pro.
 * - Loại bỏ lỗi letterSpacing tách rời ký tự tổ hợp tiếng Việt trong Canvas 2D.
 * - Hỗ trợ 3 phong cách Typography triết học: Kinh Viện Cổ Điển, Văn Khảo Khắc Đá, Minh Triết Tối Giản.
 * - Tự động cân đối kích thước chữ (Dynamic Smart Sizing) theo độ dài danh ngôn.
 * - Hoa văn hoàng gia: Chỉ viền đôi, họa tiết góc cổ điển và đường phân cách kim cương La Mã.
 */

class QuoteCardGenerator {
  constructor() {
    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.format = 'feed';        // 'feed' (1:1) hoặc 'story' (9:16)
    this.theme = 'navy';         // 'navy' (Hàn Lâm Viện), 'parchment' (Giấy Ngà Cổ), 'jade' (Ngọc Bích)
    this.fontStyle = 'classical'; // 'classical' (Kinh Viện), 'monumental' (Văn Khảo), 'zen' (Tối Giản)
    
    this.quoteText = "Kẻ nào có một lý do 'Tại sao' để sống, kẻ đó có thể chịu đựng hầu hết mọi 'Như thế nào'.";
    this.authorName = "Friedrich Nietzsche";
    this.bookTitle = "Hoàng Hôn Của Những Thần Tượng";
    this.fontsLoaded = false;

    this.init();
  }

  init() {
    const setup = () => {
      this.modal = document.getElementById('quote-card-modal');
      this.canvas = document.getElementById('quote-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }
      this.bindEvents();
      this.preloadFonts();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  /**
   * Tải trước toàn bộ biến thể font để Canvas không bị fallback sang font hệ thống lỗi dấu
   */
  async preloadFonts() {
    if (typeof document !== 'undefined' && document.fonts) {
      try {
        const fontSpecs = [
          '500 38px "Lora"',
          '600 38px "Lora"',
          'italic 22px "Lora"',
          'italic 16px "Lora"',
          'bold 26px "Playfair Display"',
          '600 38px "Playfair Display"',
          'italic 80px "Playfair Display"',
          'bold 20px "Cinzel"',
          '400 38px "Merriweather"',
          '700 26px "Merriweather"',
          '500 38px "Be Vietnam Pro"',
          'bold 26px "Be Vietnam Pro"'
        ];
        await Promise.allSettled(fontSpecs.map(f => document.fonts.load(f)));
        await document.fonts.ready;
        this.fontsLoaded = true;
        if (this.modal && !this.modal.classList.contains('hidden')) {
          this.render();
        }
      } catch (e) {
        this.fontsLoaded = true;
      }
    }
  }

  bindEvents() {
    // Đóng modal
    document.getElementById('quote-modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('quote-modal-backdrop')?.addEventListener('click', () => this.close());

    // Nút chuyển định dạng Feed / Story
    document.querySelectorAll('.quote-format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fmt = btn.getAttribute('data-format');
        this.setFormat(fmt);
      });
    });

    // Nút chọn tông màu bìa thiệp
    document.querySelectorAll('.quote-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const thm = btn.getAttribute('data-theme');
        this.setTheme(thm);
      });
    });

    // Nút chọn phong cách Font Triết Học
    document.querySelectorAll('.quote-font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fnt = btn.getAttribute('data-font');
        this.setFontStyle(fnt);
      });
    });

    // Nhập liệu trực tiếp từ textarea (tự động chuẩn hóa NFC)
    const quoteInput = document.getElementById('quote-input-text');
    quoteInput?.addEventListener('input', (e) => {
      this.quoteText = (e.target.value || "").normalize('NFC');
      this.render();
    });

    // Nút tải ảnh
    document.getElementById('quote-download-btn')?.addEventListener('click', () => this.downloadPNG());

    // Nút sao chép văn bản kèm trích dẫn
    document.getElementById('quote-copy-text-btn')?.addEventListener('click', () => this.copyToClipboard());
  }

  async open(text, author = "", book = "") {
    if (text) this.quoteText = String(text).normalize('NFC').trim();
    if (author) this.authorName = String(author).normalize('NFC').trim();
    if (book) this.bookTitle = String(book).normalize('NFC').trim();

    const quoteInput = document.getElementById('quote-input-text');
    if (quoteInput) quoteInput.value = this.quoteText;

    const authorInput = document.getElementById('quote-input-author');
    if (authorInput) authorInput.textContent = `${this.authorName} • ${this.bookTitle}`;

    if (this.modal) {
      this.modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    // Đảm bảo font chữ đã sẵn sàng
    await this.preloadFonts();
    this.render();

    // Redraw xác nhận sau 120ms để khắc phục triệt để độ trễ nạp font lần đầu
    setTimeout(() => this.render(), 120);
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

  setFontStyle(fnt) {
    this.fontStyle = fnt;
    document.querySelectorAll('.quote-font-btn').forEach(btn => {
      if (btn.getAttribute('data-font') === fnt) {
        btn.classList.add('bg-amber-500', 'text-stone-950', 'font-bold');
        btn.classList.remove('text-stone-600', 'dark:text-stone-300', 'bg-white/10');
      } else {
        btn.classList.remove('bg-amber-500', 'text-stone-950', 'font-bold');
        btn.classList.add('text-stone-600', 'dark:text-stone-300', 'hover:bg-white/10');
      }
    });
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;

    // Kích thước xuất ảnh độ nét cao 1080p chuẩn mạng xã hội
    const width = 1080;
    const height = this.format === 'story' ? 1920 : 1080;

    this.canvas.width = width;
    this.canvas.height = height;

    const ctx = this.ctx;

    // 1. Phối màu theo chủ đề kinh điển
    let bgColor = "#0E1B15";
    let bgGradientEnd = "#070E0B";
    let goldColor = "#D4AF37";
    let goldAccent = "#F3E5AB";
    let textColor = "#FBF7EE";
    let subTextColor = "#D8C7A5";
    let watermarkColor = "#8C7345";
    let textShadowColor = "rgba(0, 0, 0, 0.75)";
    let shadowBlur = 6;

    if (this.theme === 'parchment') {
      bgColor = "#F8F4EB";
      bgGradientEnd = "#E8DFCA";
      goldColor = "#9E782F";
      goldAccent = "#7A5A1E";
      textColor = "#1C2420";
      subTextColor = "#5C5242";
      watermarkColor = "#827258";
      textShadowColor = "rgba(180, 160, 130, 0.25)";
      shadowBlur = 3;
    } else if (this.theme === 'jade') {
      bgColor = "#0D261B";
      bgGradientEnd = "#05160E";
      goldColor = "#48CAE4";
      goldAccent = "#90E0EF";
      textColor = "#F0FDF4";
      subTextColor = "#BBEFDF";
      watermarkColor = "#39806A";
      textShadowColor = "rgba(0, 0, 0, 0.75)";
      shadowBlur = 6;
    }

    // Nền chuyển sắc tỏa tròn (Radial Gradient)
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.85);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, bgGradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Khung viền chỉ vàng hoàng gia (Ornate Double Border)
    const margin = this.format === 'story' ? 80 : 64;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);
    ctx.setLineDash([]);

    // Họa tiết 4 góc cổ điển sắc sảo
    const cornerSize = 42;
    this.drawCorner(ctx, margin, margin, cornerSize, goldColor, 0);
    this.drawCorner(ctx, width - margin, margin, cornerSize, goldColor, Math.PI / 2);
    this.drawCorner(ctx, width - margin, height - margin, cornerSize, goldColor, Math.PI);
    this.drawCorner(ctx, margin, height - margin, cornerSize, goldColor, -Math.PI / 2);

    // 3. Logo & Nhãn thương hiệu trên cùng
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // Header latin hoa mỹ
    ctx.font = "bold 20px 'Cinzel', 'Times New Roman', serif";
    ctx.fillStyle = goldColor;
    if ('letterSpacing' in ctx) ctx.letterSpacing = "6px";
    const headerY = this.format === 'story' ? 220 : 150;
    ctx.fillText("S O P H I A   C O D E X", width / 2, headerY);

    // Subheader tiếng Việt (QUAN TRỌNG: reset letterSpacing = 0px để tránh văng dấu)
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    ctx.font = "italic 16px 'Lora', 'Merriweather', 'Times New Roman', serif";
    ctx.fillStyle = subTextColor;
    ctx.fillText("Thư Viện Triết Học & Chiêm Nghiệm Toàn Cầu", width / 2, headerY + 36);

    // Chuẩn hóa văn bản tiếng Việt sang NFC
    const cleanQuote = (this.quoteText || "").normalize('NFC').trim();
    const cleanAuthor = (this.authorName || "KHUYẾT DANH").normalize('NFC').trim();
    const cleanBook = (this.bookTitle || "Sophia Codex").normalize('NFC').trim();

    // 4. Cấu hình Typography theo phong cách đã chọn
    // Tự động tính toán cỡ chữ thông minh (Dynamic smart sizing)
    const textLen = cleanQuote.length;
    let quoteSize = 38;
    let lineHeight = 62;

    if (textLen < 60) {
      quoteSize = this.format === 'story' ? 44 : 42;
      lineHeight = this.format === 'story' ? 72 : 68;
    } else if (textLen > 180) {
      quoteSize = this.format === 'story' ? 32 : 30;
      lineHeight = this.format === 'story' ? 52 : 50;
    } else if (textLen > 120) {
      quoteSize = this.format === 'story' ? 35 : 33;
      lineHeight = this.format === 'story' ? 56 : 54;
    } else {
      quoteSize = this.format === 'story' ? 40 : 37;
      lineHeight = this.format === 'story' ? 66 : 60;
    }

    // Font stack uy tín hỗ trợ tiếng Việt 100%, không bao giờ fallback Georgia
    let quoteFontFamily = "'Lora', 'Merriweather', 'Times New Roman', serif";
    let quoteFontWeight = "500";
    let authorFontFamily = "'Playfair Display', 'Merriweather', 'Times New Roman', serif";
    let bookFontFamily = "'Lora', 'Merriweather', 'Times New Roman', serif";

    if (this.fontStyle === 'monumental') {
      quoteFontFamily = "'Playfair Display', 'Times New Roman', serif";
      quoteFontWeight = "600";
      authorFontFamily = "'Cinzel', 'Playfair Display', 'Times New Roman', serif";
      bookFontFamily = "'Playfair Display', 'Times New Roman', serif";
    } else if (this.fontStyle === 'zen') {
      quoteFontFamily = "'Be Vietnam Pro', 'Inter', -apple-system, sans-serif";
      quoteFontWeight = "500";
      authorFontFamily = "'Be Vietnam Pro', 'Inter', sans-serif";
      bookFontFamily = "'Be Vietnam Pro', sans-serif";
    }

    // Thiết lập font danh ngôn và đo kích thước ngắt dòng
    ctx.font = `${quoteFontWeight} ${quoteSize}px ${quoteFontFamily}`;
    ctx.fillStyle = textColor;
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";

    const maxLineWidth = width - margin * 3.6;
    const lines = this.wrapText(ctx, cleanQuote, maxLineWidth);
    const totalTextHeight = lines.length * lineHeight;
    let startY = (height / 2) - (totalTextHeight / 2) + (this.format === 'story' ? -60 : -10);

    // Dấu mở ngoặc kép nghệ thuật “ cân đối với vị trí văn bản
    ctx.font = "italic 76px 'Playfair Display', 'Times New Roman', serif";
    ctx.fillStyle = goldColor;
    ctx.globalAlpha = 0.35;
    const quoteMarkY = Math.max(headerY + 75, startY - 45);
    ctx.fillText("“", width / 2, quoteMarkY);
    ctx.globalAlpha = 1.0;

    // Đổ bóng vi tế tạo hiệu ứng in dập nổi ấn tượng sâu sắc
    ctx.shadowColor = textShadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = 2;

    // Vẽ từng dòng danh ngôn
    ctx.font = `${quoteFontWeight} ${quoteSize}px ${quoteFontFamily}`;
    ctx.fillStyle = textColor;
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + (idx * lineHeight));
    });

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 5. Đường kẻ phân cách kim cương hoàng gia (Royal Diamond Divider)
    const divY = startY + totalTextHeight + 42;
    this.drawPhilosophicalDivider(ctx, width / 2, divY, 260, goldColor, goldAccent);

    // 6. Tên Tác Giả & Tác Phẩm
    ctx.font = `bold 25px ${authorFontFamily}`;
    ctx.fillStyle = goldColor;
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    ctx.fillText(cleanAuthor.toUpperCase(), width / 2, divY + 54);

    ctx.font = `italic 20px ${bookFontFamily}`;
    ctx.fillStyle = subTextColor;
    ctx.fillText(cleanBook, width / 2, divY + 88);

    // 7. Watermark chân trang thanh nhã
    ctx.font = "14px 'Be Vietnam Pro', 'Inter', -apple-system, sans-serif";
    ctx.fillStyle = watermarkColor;
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    const footerY = height - margin - 32;
    ctx.fillText("📖 Sophia Codex • Triết Học Toàn Văn & Chiêm Nghiệm Sống • sophiacodex.vn", width / 2, footerY);

    // Cập nhật xem trước ảnh
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

  drawPhilosophicalDivider(ctx, centerX, y, length, color, accentColor) {
    const halfLen = length / 2;

    // Đường chỉ vàng mờ dần 2 phía
    const gradLeft = ctx.createLinearGradient(centerX - halfLen, y, centerX - 25, y);
    gradLeft.addColorStop(0, 'rgba(212, 175, 55, 0)');
    gradLeft.addColorStop(1, color);
    ctx.strokeStyle = gradLeft;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - halfLen, y);
    ctx.lineTo(centerX - 25, y);
    ctx.stroke();

    const gradRight = ctx.createLinearGradient(centerX + 25, y, centerX + halfLen, y);
    gradRight.addColorStop(0, color);
    gradRight.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.strokeStyle = gradRight;
    ctx.beginPath();
    ctx.moveTo(centerX + 25, y);
    ctx.lineTo(centerX + halfLen, y);
    ctx.stroke();

    // Họa tiết kim cương cổ điển ở chính tâm
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, y - 6);
    ctx.lineTo(centerX + 6, y);
    ctx.lineTo(centerX, y + 6);
    ctx.lineTo(centerX - 6, y);
    ctx.closePath();
    ctx.fill();

    // Hai điểm chấm tinh tế hai bên
    ctx.beginPath();
    ctx.arc(centerX - 14, y, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 14, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const normalized = text.normalize('NFC');
    const paragraphs = normalized.split('\n');
    const allLines = [];

    for (const para of paragraphs) {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        const width = ctx.measureText(testLine).width;
        if (width <= maxWidth) {
          currentLine = testLine;
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
    const safeTitle = (this.bookTitle || 'quote').toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `sophia-codex-quote-${this.format}-${safeTitle}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();

    // Đồng bộ tăng lượt chia sẻ thiệp vào cơ sở dữ liệu
    fetch('/api/quotes/1/share', { method: 'POST' }).catch(() => {});

    if (window.readerEngine) {
      window.readerEngine.showToast("Đã tải ảnh thiệp danh ngôn chuẩn 1080p sắc nét!");
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
