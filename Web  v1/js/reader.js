/**
 * SOPHIA CODEX - READER ENGINE (PROFESSIONAL EDITION)
 * Trình đọc toàn văn chuẩn sách điện tử cao cấp với:
 * - Đọc toàn văn chi tiết, phân chương chuyên nghiệp
 * - Đo lường tiến độ cuộn trang & ước tính thời gian đọc còn lại
 * - Chuyển đổi font chữ chuẩn: Merriweather, Lora, Be Vietnam Pro
 * - Tương tác bôi đen hỏi Hiền Triết AI hoặc nghe đọc riêng
 */

class ReaderEngine {
  constructor() {
    this.currentBook = null;
    this.currentChapterIndex = 0;
    this.fontSize = 19; // px chuẩn sách đọc
    this.fontFamily = 'Merriweather';
    this.selectedText = "";

    this.readerView = document.getElementById('view-reader');
    this.catalogView = document.getElementById('view-catalog');
    this.readerBody = document.getElementById('reader-body');
    this.tocContainer = document.getElementById('reader-toc-list');
    this.popup = document.getElementById('text-selection-popup');
    this.readingProgressEl = document.getElementById('reader-reading-progress');
    this.timeLeftEl = document.getElementById('reader-time-left');

    this.initEvents();
  }

  initEvents() {
    // Back to catalog
    document.getElementById('reader-back-btn')?.addEventListener('click', () => {
      this.closeReader();
    });

    // Font size controls
    document.getElementById('font-decrease-btn')?.addEventListener('click', () => {
      this.fontSize = Math.max(15, this.fontSize - 1);
      this.updateTypography();
    });

    document.getElementById('font-increase-btn')?.addEventListener('click', () => {
      this.fontSize = Math.min(28, this.fontSize + 1);
      this.updateTypography();
    });

    // Font family switchers
    document.querySelectorAll('.font-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fontName = btn.getAttribute('data-font');
        this.setFontFamily(fontName);
      });
    });

    // Theme togglers
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        document.body.className = theme === 'light' ? '' : `theme-${theme}`;
      });
    });

    // Window scroll progress bar & remaining time calculation
    window.addEventListener('scroll', () => {
      const progressBar = document.getElementById('reading-scroll-progress');
      if (!progressBar) return;
      if (this.readerView && !this.readerView.classList.contains('hidden')) {
        progressBar.classList.remove('hidden');
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        
        if (this.readingProgressEl) {
          this.readingProgressEl.textContent = `${Math.round(progress)}% đã đọc`;
        }
      } else {
        progressBar.classList.add('hidden');
      }
    });

    // Selection popup events
    document.addEventListener('selectionchange', () => this.handleSelection());
    
    document.getElementById('popup-ask-ai')?.addEventListener('click', () => {
      if (this.selectedText && window.aiChat) {
        window.aiChat.askWithSelection(this.selectedText);
        this.hideSelectionPopup();
      }
    });

    document.getElementById('popup-listen')?.addEventListener('click', () => {
      if (this.selectedText && window.audioEngine) {
        window.audioEngine.readSpecificText(this.selectedText);
        this.hideSelectionPopup();
      }
    });

    document.getElementById('popup-copy')?.addEventListener('click', () => {
      if (this.selectedText) {
        navigator.clipboard.writeText(this.selectedText);
        this.showToast("Đã sao chép trích đoạn!");
        this.hideSelectionPopup();
      }
    });

    document.getElementById('popup-quote-card')?.addEventListener('click', () => {
      if (this.selectedText && window.quoteGenerator) {
        const bookTitle = this.currentBook ? this.currentBook.title : "Kinh Điển Triết Học";
        const author = this.currentBook ? this.currentBook.author : "Hiền Triết";
        window.quoteGenerator.open(this.selectedText, author, bookTitle);
        this.hideSelectionPopup();
      }
    });

    // Reader BGM Toggle & Volume
    document.getElementById('reader-bgm-toggle')?.addEventListener('click', () => {
      if (window.bgmEngine) {
        window.bgmEngine.toggle(this.currentBook ? this.currentBook.id : 'suy-tuong');
      }
    });

    document.getElementById('reader-bgm-volume')?.addEventListener('input', (e) => {
      if (window.bgmEngine) {
        window.bgmEngine.setVolume(parseFloat(e.target.value));
      }
    });

    // Ngăn chặn sự kiện mousedown trên popup làm mất vùng chọn văn bản
    this.popup?.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    // Hide popup when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (this.popup && !this.popup.contains(e.target) && !this.readerBody?.contains(e.target)) {
        this.hideSelectionPopup();
      }
    });
  }

  setFontFamily(font) {
    this.fontFamily = font;
    document.querySelectorAll('.font-choice-btn').forEach(b => {
      if (b.getAttribute('data-font') === font) {
        b.classList.add('bg-emerald-950', 'text-amber-300', 'font-bold', 'ring-1', 'ring-amber-500/40');
        b.classList.remove('text-stone-600', 'hover:bg-stone-200');
      } else {
        b.classList.remove('bg-emerald-950', 'text-amber-300', 'font-bold', 'ring-1', 'ring-amber-500/40');
        b.classList.add('text-stone-600');
      }
    });
    this.updateTypography();
  }

  updateTypography() {
    if (!this.readerBody) return;
    this.readerBody.style.fontSize = `${this.fontSize}px`;
    
    if (this.fontFamily === 'Inter' || this.fontFamily === 'vietnam') {
      this.readerBody.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    } else if (this.fontFamily === 'Playfair') {
      this.readerBody.style.fontFamily = "'Playfair Display', Georgia, serif";
    } else if (this.fontFamily === 'Merriweather') {
      this.readerBody.style.fontFamily = "'Merriweather', Georgia, serif";
    } else {
      // Mặc định font Lora văn học mượt mà, tao nhã, không mỏi mắt
      this.readerBody.style.fontFamily = "'Lora', Georgia, 'Times New Roman', serif";
    }
  }

  async openBook(bookId, chapterIndex = 0) {
    let book = null;
    try {
      const res = await fetch(`/api/books/${bookId}`);
      if (res.ok) {
        book = await res.json();
        if (book) {
          book.school = book.school || 'Kinh Điển Triết Học';
          book.bgmTheme = book.bgm_theme || book.bgmTheme || "Nhạc nền thiền định";
          book.readTime = book.read_time || book.readTime || "15 phút đọc";
        }
      }
    } catch (e) {}

    if (!book) {
      book = PHILOSOPHY_DATA.books.find(b => b.id === bookId);
    }
    if (!book) return;

    // Chuẩn hóa thuộc tính number cho từng chương (khắc phục bất đồng bộ với SQLite)
    if (book.chapters) {
      book.chapters.forEach((c, i) => {
        c.number = c.number || c.chapter_number || `Chương ${i + 1}`;
      });
    }

    this.currentBook = book;
    this.currentChapterIndex = chapterIndex;

    // Cập nhật tiêu đề & tác giả
    const titleEl = document.getElementById('reader-book-title');
    const authorEl = document.getElementById('reader-book-author');
    const badgeEl = document.getElementById('reader-book-school');
    const bgmBadgeEl = document.getElementById('reader-bgm-name');

    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = `${book.author} (${book.year || ''})`;
    if (badgeEl) badgeEl.textContent = book.school;
    if (bgmBadgeEl) bgmBadgeEl.textContent = book.bgmTheme || "Nhạc nền thiền định";

    // Cập nhật nhạc nền BGM phù hợp
    if (window.bgmEngine) {
      window.bgmEngine.setBook(book.id);
    }

    this.renderTOC();
    this.renderChapter(chapterIndex);

    // Bật Reader View và ẩn Catalog
    this.catalogView?.classList.add('hidden');
    this.readerView?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cập nhật AI context
    if (window.aiChat) {
      const chap = (book.chapters && book.chapters[chapterIndex]) ? book.chapters[chapterIndex] : null;
      window.aiChat.setContext(book, chap);
    }
  }

  closeReader() {
    this.readerView?.classList.add('hidden');
    this.catalogView?.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.stop();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderTOC() {
    if (!this.tocContainer || !this.currentBook || !this.currentBook.chapters) return;
    this.tocContainer.innerHTML = '';

    this.currentBook.chapters.forEach((chap, idx) => {
      chap.number = chap.number || chap.chapter_number || `Chương ${idx + 1}`;
      const active = idx === this.currentChapterIndex;
      const item = document.createElement('button');
      item.className = `w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 text-sm ${
        active 
          ? 'bg-emerald-950 text-amber-200 font-semibold shadow-md border-l-4 border-amber-500' 
          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/40'
      }`;
      item.innerHTML = `
        <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          active ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
        }">${idx + 1}</span>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] uppercase tracking-wider font-display ${active ? 'text-amber-300' : 'text-stone-500'}">${chap.number}</div>
          <div class="line-clamp-2 text-xs leading-snug mt-0.5">${chap.title}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        this.renderChapter(idx);
      });
      this.tocContainer.appendChild(item);
    });
  }

  renderChapter(index) {
    if (!this.currentBook || !this.currentBook.chapters || this.currentBook.chapters.length === 0) return;
    index = Math.max(0, Math.min(this.currentBook.chapters.length - 1, index));
    this.currentChapterIndex = index;
    const chapter = this.currentBook.chapters[index];
    if (!chapter) return;
    chapter.number = chapter.number || chapter.chapter_number || `Chương ${index + 1}`;

    const chapHeading = document.getElementById('reader-chapter-heading');
    const chapSubtitle = document.getElementById('reader-chapter-sub');

    if (chapHeading) chapHeading.textContent = `${chapter.number}: ${chapter.title}`;
    if (chapSubtitle) chapSubtitle.textContent = `Tác phẩm: ${this.currentBook.title} — ${this.currentBook.author}`;

    // Cập nhật trạng thái các nút Chuyển chương trước / sau
    const prevBtn = document.getElementById('reader-prev-chapter-btn');
    const nextBtn = document.getElementById('reader-next-chapter-btn');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === this.currentBook.chapters.length - 1;

    // Tính ước tính thời gian đọc còn lại (ước tính 180 từ/phút)
    let totalWords = 0;
    if (this.readerBody) {
      this.readerBody.innerHTML = '';
      chapter.paragraphs.forEach((pText, pIdx) => {
        totalWords += pText.split(/\s+/).length;
        const p = document.createElement('p');
        p.id = `para-${pIdx}`;
        p.className = 'leading-relaxed mb-6 cursor-text transition-colors duration-200';
        p.textContent = pText;
        this.readerBody.appendChild(p);
      });

      // Render Hộp Chiêm Nghiệm Thực Tiễn Cuối Chương
      const takeaways = chapter.takeaways || [
        {
          title: "Làm Chủ Tâm Trí Trước Biến Cố",
          desc: "Bạn không thể kiểm soát nghịch cảnh bên ngoài, nhưng hoàn toàn có thể kiểm soát thái độ và phản ứng của bản thân."
        },
        {
          title: "Hành Động Vì Lương Tri",
          desc: "Làm điều tốt vì đó là bổn phận của một con người chính trực, không phải vì mong cầu người khác khen ngợi hay đền đáp."
        }
      ];

      const takeawayBox = document.createElement('div');
      takeawayBox.className = 'mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-950/5 to-amber-500/15 border border-amber-600/30 shadow-sm space-y-4';
      
      const safeBookTitle = (this.currentBook.title || '').replace(/'/g, "\\'");
      const safeAuthor = (this.currentBook.author || '').replace(/'/g, "\\'");
      const firstQuote = (chapter.paragraphs[0] || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

      takeawayBox.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-amber-600/20">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">💡</span>
            <div>
              <h4 class="font-bold text-stone-900 dark:text-stone-100 text-sm md:text-base">Chiêm Nghiệm Thực Tiễn & Ứng Dụng Đời Sống</h4>
              <p class="text-[11px] text-stone-500 dark:text-stone-400">Ứng dụng tư tưởng ${this.currentBook.title} vào công việc & tâm lý hiện đại</p>
            </div>
          </div>
          <button onclick="window.quoteGenerator?.open('${firstQuote}', '${safeAuthor}', '${safeBookTitle} - ${chapter.number}')" 
                  class="px-3.5 py-1.5 rounded-full bg-emerald-950 text-amber-200 text-xs font-semibold hover:bg-emerald-900 border border-amber-500/40 flex items-center gap-1.5 shadow-sm transition-all hover:scale-105">
            <span>📸 Tạo ảnh Facebook chương này</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          ${takeaways.map((item, tIdx) => {
            const safeItemDesc = (item.desc || item.description || '').replace(/'/g, "\\'");
            const safeItemTitle = (item.title || '').replace(/'/g, "\\'");
            return `
            <div class="p-4 rounded-2xl bg-white/85 dark:bg-[#111E17] border border-stone-200/80 dark:border-emerald-900/60 shadow-xs flex items-start gap-3">
              <span class="w-6 h-6 rounded-lg bg-emerald-950 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">${tIdx + 1}</span>
              <div class="min-w-0 flex-1">
                <h5 class="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">${item.title}</h5>
                <p class="text-[12px] text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">${item.desc || item.description || ''}</p>
                <button onclick="window.quoteGenerator?.open('${safeItemTitle}: ${safeItemDesc}', '${safeAuthor}', '${safeBookTitle}')" 
                        class="mt-2.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  <span>Tạo ảnh trích dẫn này →</span>
                </button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      `;
      this.readerBody.appendChild(takeawayBox);

      this.updateTypography();
    }

    const estimatedMinutes = Math.max(1, Math.round(totalWords / 180));
    if (this.timeLeftEl) {
      this.timeLeftEl.textContent = `Ước tính: ~${estimatedMinutes} phút đọc (${chapter.paragraphs.length} đoạn)`;
    }

    // Nạp vào Audio Engine để sẵn sàng nghe (không ép hiện dock audio)
    if (window.audioEngine) {
      window.audioEngine.loadChapter(this.currentBook, index, false);
    }

    this.renderTOC();
    // Cuộn trang mượt mà lên đầu chương mới
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ghi nhận nhật ký đọc sâu vào cơ sở dữ liệu SQLite
    this.logReadingSession(this.currentBook.id, chapter.id || `${this.currentBook.id}-c${index + 1}`);
  }

  prevChapter() {
    if (!this.currentBook || !this.currentBook.chapters) return;
    if (this.currentChapterIndex <= 0) {
      this.showToast("Bạn đang ở chương đầu tiên của tác phẩm.");
      return;
    }
    this.renderChapter(this.currentChapterIndex - 1);
  }

  nextChapter() {
    if (!this.currentBook || !this.currentBook.chapters) return;
    if (this.currentChapterIndex >= this.currentBook.chapters.length - 1) {
      this.showToast("Bạn đã đọc đến chương cuối cùng của tác phẩm!");
      return;
    }
    this.renderChapter(this.currentChapterIndex + 1);
  }

  logReadingSession(bookId, chapterId) {
    try {
      fetch('/api/reading-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          chapter_id: chapterId,
          duration_seconds: 90,
          scroll_depth: 100,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop'
        })
      }).catch(() => {});
    } catch (e) {}
  }

  handleSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < 5 || !this.readerBody?.contains(selection.anchorNode)) {
      this.hideSelectionPopup();
      return;
    }

    this.selectedText = text;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (this.popup) {
      this.popup.style.top = `${rect.top + window.scrollY - 10}px`;
      this.popup.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
      this.popup.classList.remove('hidden');
    }
  }

  hideSelectionPopup() {
    this.popup?.classList.add('hidden');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-amber-200 text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }
}

// Khởi tạo toàn cục
window.readerEngine = new ReaderEngine();
