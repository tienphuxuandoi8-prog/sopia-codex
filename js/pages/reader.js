/**
 * SOPHIA CODEX - READER ENGINE (PROFESSIONAL EDITION)
 * Trình đọc toàn văn chuẩn sách điện tử cao cấp với:
 * - Đọc toàn văn chi tiết, phân chương chuyên nghiệp
 * - Đo lường tiến độ cuộn trang & ước tính thời gian đọc còn lại
 * - Chuyển đổi font chữ chuẩn: Merriweather, Lora, Be Vietnam Pro
 * - Tương tác bôi đen hỏi Hiền Triết AI hoặc nghe đọc riêng
 * - Highlight lưu trữ, progress sync, reading session log
 */

class ReaderEngine {
  constructor() {
    this.currentBook = null;
    this.currentChapterIndex = 0;
    this.fontSize = 19; // px chuẩn sách đọc
    this.fontFamily = 'Merriweather';
    this.selectedText = "";
    this.currentSelectionRange = null;
    this.selectedParagraphIndex = 0;
    this.selectedStartOffset = 0;
    this.selectedEndOffset = 0;

    this.readerView = document.getElementById('view-reader');
    this.catalogView = document.getElementById('view-catalog');
    this.readerBody = document.getElementById('reader-body');
    this.tocContainer = document.getElementById('reader-toc-list');
    
    // Popup container (sẽ được lazy-init hoặc gắn event sau)
    this.popup = document.getElementById('text-selection-popup');
    
    this.readingProgressEl = document.getElementById('reader-reading-progress');
    this.timeLeftEl = document.getElementById('reader-time-left');

    this.progressTimeout = null;
    this.currentProgressPct = 0;

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
      if (this.readerView && !this.readerView.classList.contains('hidden')) {
        if (progressBar) progressBar.classList.remove('hidden');
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
        if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        
        if (this.readingProgressEl) {
          this.readingProgressEl.textContent = `${Math.round(progress)}% đã đọc`;
        }

        this.scheduleProgressSave(progress);
      } else {
        if (progressBar) progressBar.classList.add('hidden');
      }
    });

    // Save progress immediately if page is hidden
    window.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentBook) {
        this.saveProgressBeacon();
      }
    });

    // Periodic reading session log (every 30s)
    setInterval(() => {
        if (this.currentBook && !document.hidden && this.readerView && !this.readerView.classList.contains('hidden')) {
            this.logReadingSessionAPI();
        }
    }, 30000);

    // Selection popup events
    document.addEventListener('selectionchange', () => this.handleSelection());
    
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
    if (this.popup) {
        this.popup.addEventListener('mousedown', (e) => {
          e.preventDefault();
        });
    }

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
      const res = await fetch(`/api/v1/books/${bookId}`);
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
      if (typeof PHILOSOPHY_DATA !== 'undefined' && PHILOSOPHY_DATA.books) {
        book = PHILOSOPHY_DATA.books.find(b => b.id === bookId);
      }
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
    await this.renderChapter(chapterIndex);

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
      
      let lockBadge = '';
      const hasPremium = window.Auth && typeof window.Auth.hasPremium === 'function' ? window.Auth.hasPremium() : false;
      if (chap.accessLevel === 'PREMIUM' && !hasPremium) {
        lockBadge = ' <span title="Premium">🔒</span>';
      }

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
          <div class="line-clamp-2 text-xs leading-snug mt-0.5">${chap.title}${lockBadge}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        this.renderChapter(idx);
      });
      this.tocContainer.appendChild(item);
    });
  }

  async renderChapter(index) {
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
        p.className = 'reader-para leading-relaxed mb-6 cursor-text transition-colors duration-200';
        p.textContent = pText;
        this.readerBody.appendChild(p);
      });

      if (chapter.locked === true) {
        const lockCard = document.createElement('div');
        lockCard.innerHTML = `
      <div class="my-10 p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 border border-amber-500/40 text-center shadow-2xl space-y-4">
        <div class="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
          <i data-lucide="lock" class="w-7 h-7"></i>
        </div>
        <h3 class="text-xl font-display font-bold text-amber-200">Kiệt Tác Này Thuộc Đặc Quyền Sophia Premium</h3>
        <p class="text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
          Bạn vừa đọc xong phần trích đoạn mở đầu. Để chiêm nghiệm trọn vẹn toàn bộ văn bản gốc cùng các chú giải triết học sâu sắc và đàm đạo không giới hạn với Socrates AI, hãy nâng cấp tài khoản của bạn.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href="/pricing.html" class="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-md transition-all">
            ✨ Mở Khóa Toàn Bộ Chỉ Từ 49.000đ
          </a>
          <button onclick="if(window.Auth && !window.Auth.isLoggedIn()) window.location.href='/login.html?next='+encodeURIComponent(window.location.pathname+window.location.search);" class="px-5 py-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-sm border border-stone-700 transition-all">
            Đã có gói? Đăng nhập
          </button>
        </div>
      </div>`;
        this.readerBody.appendChild(lockCard);
        if (window.lucide) window.lucide.createIcons();
      } else {
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
      }

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

    // Restore Highlights
    await this.restoreHighlights(chapter.id || chapter.chapterId || chapter.chapter_number || index.toString());

    // Ghi nhận nhật ký đọc sâu vào cơ sở dữ liệu
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

  // --- LOGGING VÀ PROGRESS SYNC ---

  logReadingSession(bookId, chapterId) {
    // Old legacy API method
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

  async logReadingSessionAPI() {
    const token = localStorage.getItem('token');
    if (!token || !this.currentBook) return;
    try {
      await fetch('/api/v1/reader/sessions', {
         method: 'POST',
         headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: this.currentBook.id,
          chapterId: this.currentBook.chapters[this.currentChapterIndex]?.id || this.currentChapterIndex.toString(),
          durationSeconds: 30
        })
      });
    } catch(e) {}
  }

  scheduleProgressSave(progressPct) {
    if (this.progressTimeout) clearTimeout(this.progressTimeout);
    this.currentProgressPct = progressPct;
    this.progressTimeout = setTimeout(() => {
      this.saveProgressAPI();
    }, 5000);
  }

  getVisibleParagraphIndex() {
    let paragraphIndex = 0;
    if (this.readerBody) {
      const paragraphs = this.readerBody.querySelectorAll('.reader-para');
      for(let i=0; i<paragraphs.length; i++) {
        const rect = paragraphs[i].getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight/2) {
           paragraphIndex = parseInt(paragraphs[i].id.split('-')[1] || "0");
           break;
        }
      }
    }
    return paragraphIndex;
  }

  async saveProgressAPI() {
    const token = localStorage.getItem('token');
    if (!token || !this.currentBook) return;
    try {
      const paragraphIndex = this.getVisibleParagraphIndex();
      const chapterId = this.currentBook.chapters[this.currentChapterIndex]?.id || this.currentChapterIndex.toString();
      
      await fetch(`/api/v1/reader/progress/${this.currentBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapterId: chapterId,
          paragraphIndex: paragraphIndex,
          progressPct: Math.round(this.currentProgressPct || 0)
        })
      });
    } catch(e) {}
  }

  saveProgressBeacon() {
    const token = localStorage.getItem('token');
    if (!token || !this.currentBook) return;
    const paragraphIndex = this.getVisibleParagraphIndex();
    const chapterId = this.currentBook.chapters[this.currentChapterIndex]?.id || this.currentChapterIndex.toString();

    const payload = JSON.stringify({
      chapterId: chapterId,
      paragraphIndex: paragraphIndex,
      progressPct: Math.round(this.currentProgressPct || 0)
    });

    try {
      // Dùng fetch với keepalive thay cho sendBeacon để có thể gửi header Authorization
      fetch(`/api/v1/reader/progress/${this.currentBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: payload,
        keepalive: true
      });
    } catch(e) {}
  }

  // --- HIGHLIGHT & TEXT SELECTION POPUP ---

  handleSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < 5 || !this.readerBody?.contains(selection.anchorNode)) {
      this.hideSelectionPopup();
      return;
    }

    this.selectedText = text;
    if (selection.rangeCount > 0) {
      this.currentSelectionRange = selection.getRangeAt(0).cloneRange();
    }
    
    // Tìm paragraph index & offset
    let node = selection.anchorNode;
    let pNode = node.nodeType === 3 ? node.parentNode.closest('p') : node.closest('p');
    if (pNode && pNode.id && pNode.id.startsWith('para-')) {
        this.selectedParagraphIndex = parseInt(pNode.id.split('-')[1]);
        const pText = pNode.textContent;
        this.selectedStartOffset = pText.indexOf(text);
        if (this.selectedStartOffset === -1) this.selectedStartOffset = 0;
        this.selectedEndOffset = this.selectedStartOffset + text.length;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (!this.popup) {
      this.popup = document.createElement('div');
      this.popup.id = 'text-selection-popup';
      document.body.appendChild(this.popup);
    }
    
    this.popup.className = 'absolute z-50 bg-white dark:bg-stone-800 shadow-xl rounded-lg border border-gray-200 dark:border-stone-700 flex flex-col overflow-hidden text-stone-800 transition-opacity';
    
    this.popup.innerHTML = `
      <div class="flex items-center px-3 py-2 border-b border-gray-100 dark:border-stone-700">
         <button class="w-6 h-6 rounded-full bg-amber-400 mr-2 highlight-color-btn transform hover:scale-110 transition-transform shadow-sm" data-color="gold" title="Vàng"></button>
         <button class="w-6 h-6 rounded-full bg-emerald-400 mr-2 highlight-color-btn transform hover:scale-110 transition-transform shadow-sm" data-color="emerald" title="Lục"></button>
         <button class="w-6 h-6 rounded-full bg-rose-400 mr-2 highlight-color-btn transform hover:scale-110 transition-transform shadow-sm" data-color="rose" title="Hồng"></button>
         <div class="h-5 w-px bg-gray-300 dark:bg-stone-600 mx-2"></div>
         <button class="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-stone-700 rounded flex items-center" id="popup-note-btn"><i class="fas fa-pen-nib mr-1.5 text-gray-500"></i> Ghi chú</button>
      </div>
      <div class="flex items-center px-2 py-1 bg-gray-50 dark:bg-stone-800/50">
         <button class="px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-stone-700 rounded mr-1 flex items-center" id="popup-ask-ai-btn"><i class="fas fa-robot mr-1.5 text-blue-500"></i> Hỏi Socrates</button>
         <button class="px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-stone-700 rounded mr-1 flex items-center" id="popup-quote-card-btn"><i class="fas fa-image mr-1.5 text-purple-500"></i> Tạo thiệp</button>
      </div>
      <div id="popup-note-container" class="hidden px-3 py-3 border-t border-gray-100 dark:border-stone-700 bg-white dark:bg-stone-800">
         <input type="text" id="popup-note-input" placeholder="Nhập ghi chú của bạn..." class="w-full text-sm px-3 py-2 border border-gray-300 dark:border-stone-600 rounded outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-stone-900 dark:text-stone-100 transition-all">
         <button id="popup-note-save-btn" class="mt-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm py-1.5 rounded transition-colors shadow-sm">Lưu Trích Dẫn & Ghi Chú</button>
      </div>
    `;

    // Gắn sự kiện cho popup
    this.popup.addEventListener('mousedown', (e) => e.preventDefault());

    this.popup.querySelectorAll('.highlight-color-btn').forEach(btn => {
       btn.addEventListener('click', (e) => {
           e.stopPropagation();
           this.saveHighlight(btn.dataset.color, '');
       });
    });

    this.popup.querySelector('#popup-note-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const container = this.popup.querySelector('#popup-note-container');
        container.classList.remove('hidden');
        this.popup.querySelector('#popup-note-input').focus();
    });

    this.popup.querySelector('#popup-note-save-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const note = this.popup.querySelector('#popup-note-input').value;
        this.saveHighlight('gold', note); // Default color for note
    });

    this.popup.querySelector('#popup-ask-ai-btn').addEventListener('click', (e) => {
       e.stopPropagation();
       if (window.aiChat) window.aiChat.askWithSelection(this.selectedText);
       this.hideSelectionPopup();
    });

    this.popup.querySelector('#popup-quote-card-btn').addEventListener('click', (e) => {
       e.stopPropagation();
       if (window.quoteGenerator) {
          const bookTitle = this.currentBook ? this.currentBook.title : "Kinh Điển Triết Học";
          const author = this.currentBook ? this.currentBook.author : "Hiền Triết";
          window.quoteGenerator.open(this.selectedText, author, bookTitle);
       }
       this.hideSelectionPopup();
    });

    // Định vị popup
    this.popup.style.top = `${rect.top + window.scrollY - this.popup.offsetHeight - 15}px`;
    this.popup.style.left = `${rect.left + window.scrollX + rect.width / 2 - this.popup.offsetWidth / 2}px`;
    
    if (rect.top - this.popup.offsetHeight - 15 < 0) {
        this.popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    }

    this.popup.classList.remove('hidden');
  }

  hideSelectionPopup() {
    this.popup?.classList.add('hidden');
  }

  async saveHighlight(color, note) {
      if (!this.selectedText || !this.currentBook) return;
      const chapterId = this.currentBook.chapters[this.currentChapterIndex]?.id || this.currentChapterIndex.toString();
      
      const payload = {
          bookId: this.currentBook.id,
          chapterId: chapterId,
          paragraphIndex: this.selectedParagraphIndex,
          startOffset: this.selectedStartOffset,
          endOffset: this.selectedEndOffset,
          quoteText: this.selectedText,
          color: color,
          note: note
      };

      // Áp dụng bôi đen ngay lập tức để phản hồi nhanh UI
      if (this.currentSelectionRange) {
        this.applyInlineHighlight(this.currentSelectionRange, color);
      }

      this.hideSelectionPopup();
      window.getSelection().removeAllRanges();

      const token = localStorage.getItem('token');
      if (token) {
         try {
             const res = await fetch('/api/v1/reader/highlights', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify(payload)
             });
             if (res.ok) {
                 this.showToast('Đã lưu trích dẫn vào sổ tay!');
             }
         } catch(e) {
             console.error('Lỗi khi lưu highlight', e);
         }
      } else {
         this.showToast('Đã lưu trích dẫn cục bộ (hãy đăng nhập để đồng bộ)');
      }
  }

  applyInlineHighlight(range, color) {
      const colorMap = {
          'gold': 'bg-amber-400/30 text-amber-900 border-b-2 border-amber-400 font-medium rounded-sm',
          'emerald': 'bg-emerald-400/30 text-emerald-900 border-b-2 border-emerald-400 font-medium rounded-sm',
          'rose': 'bg-rose-400/30 text-rose-900 border-b-2 border-rose-400 font-medium rounded-sm'
      };
      const mark = document.createElement('mark');
      mark.className = colorMap[color] || colorMap['gold'];
      try {
          mark.textContent = range.toString();
          range.deleteContents();
          range.insertNode(mark);
      } catch(e) {
          console.warn('Không thể bọc highlight trực tiếp bằng Range, fallback:', e);
      }
  }

  async restoreHighlights(chapterId) {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
          const res = await fetch(`/api/v1/reader/highlights?chapterId=${chapterId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              const highlights = data.highlights || [];
              const colorMap = {
                    'gold': 'bg-amber-400/30 text-amber-900 border-b-2 border-amber-400 font-medium rounded-sm cursor-pointer',
                    'emerald': 'bg-emerald-400/30 text-emerald-900 border-b-2 border-emerald-400 font-medium rounded-sm cursor-pointer',
                    'rose': 'bg-rose-400/30 text-rose-900 border-b-2 border-rose-400 font-medium rounded-sm cursor-pointer'
              };
              
              highlights.forEach(h => {
                  const pNode = document.getElementById(`para-${h.paragraphIndex}`);
                  if (pNode) {
                      const textToHighlight = h.quoteText;
                      if (pNode.innerHTML.includes(textToHighlight)) {
                           const cls = colorMap[h.color] || colorMap['gold'];
                           // Thực hiện replace nội dung HTML đơn giản (nếu chưa có thẻ HTML lồng nhau trong đoạn)
                           pNode.innerHTML = pNode.innerHTML.replace(
                               textToHighlight, 
                               `<mark class="${cls}" title="${h.note || ''}">${textToHighlight}</mark>`
                           );
                      }
                  }
              });
          }
      } catch (e) {
          console.error('Lỗi khi khôi phục highlight:', e);
      }
  }

  // --- UTILS ---

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-amber-200 text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

// Khởi tạo toàn cục
window.readerEngine = new ReaderEngine();
