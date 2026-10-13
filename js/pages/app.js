/**
 * SOPHIA CODEX - APPLICATION CONTROLLER (PROFESSIONAL EDITION)
 * Quản lý trang chủ, thống kê thư viện, tường triết gia và kết nối toàn bộ module
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderHeaderStats();
  renderCategoryPills();
  renderBooksGrid();
  renderPhilosophers();
  renderDailyQuote();
  initSearch();
  initMobileMenu();

  // Check URL query parameters (hỗ trợ điều hướng liên kết từ library, pricing, admin)
  try {
    const params = new URLSearchParams(window.location.search);
    const bookParam = params.get('book');
    const schoolParam = params.get('school');
    const actionParam = params.get('action');

    if (bookParam) {
      setTimeout(() => {
        if (window.openBookReader) window.openBookReader(bookParam);
      }, 400);
    } else if (schoolParam) {
      setTimeout(() => {
        if (window.selectSidebarMenu) window.selectSidebarMenu(schoolParam);
      }, 200);
    } else if (actionParam === 'audio') {
      setTimeout(() => {
        if (window.openAudioStudioModal) window.openAudioStudioModal();
      }, 200);
    } else if (actionParam === 'premium') {
      setTimeout(() => {
        if (window.openSophiaPremiumModal) window.openSophiaPremiumModal();
      }, 200);
    }
  } catch(e) {}

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 1. Render Header / Hero Quick Stats
async function renderHeaderStats() {
  const countBooksEl = document.getElementById('stat-books-count');
  const countChapsEl = document.getElementById('stat-chapters-count');
  const countReadersEl = document.getElementById('stat-readers-count');

  try {
    const res = await fetch('/api/overview');
    if (res.ok) {
      const data = await res.json();
      if (data.kpis) {
        if (countBooksEl) countBooksEl.textContent = `${data.kpis.totalBooks} Tác Phẩm Toàn Văn`;
        if (countChapsEl) countChapsEl.textContent = `${data.kpis.totalChapters} Chương Kinh Điển`;
        if (countReadersEl) countReadersEl.textContent = data.kpis.activeReaders || '68,400+';
        return;
      }
    }
  } catch(e) {}

  const stats = PHILOSOPHY_DATA.stats;
  if (countBooksEl) countBooksEl.textContent = `${stats.totalBooks} Tác Phẩm Toàn Văn`;
  if (countChapsEl) countChapsEl.textContent = `${stats.totalChapters || 99} Chương Kinh Điển`;
  if (countReadersEl) countReadersEl.textContent = stats.readersCount;
}

// 2. Render Category Filter Pills
function renderCategoryPills() {
  const container = document.getElementById('category-pills');
  if (!container) return;

  container.innerHTML = '';
  PHILOSOPHY_DATA.categories.forEach((cat, idx) => {
    const btn = document.createElement('button');
    const isFirst = idx === 0;
    btn.className = `category-pill px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
      isFirst 
        ? 'bg-emerald-950 text-amber-300 shadow-md font-semibold ring-1 ring-amber-500/40' 
        : 'bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/80 border border-stone-200/60 dark:border-stone-700'
    }`;
    btn.setAttribute('data-category', cat.id);
    btn.innerHTML = `
      <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"></i>
      <span>${cat.name}</span>
      <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 font-mono">${cat.count}</span>
    `;

    btn.addEventListener('click', () => {
      // Đồng bộ hai chiều với thanh menu bên trái
      if (window.selectSidebarMenu) {
        window.selectSidebarMenu(cat.id === 'all' ? 'explore' : cat.id, false);
      } else {
        filterBooks(cat.id);
      }
    });

    container.appendChild(btn);
  });
}

let cachedBooks = null;

async function getBooksList() {
  if (cachedBooks) return cachedBooks;
  const masterBooks = (typeof PHILOSOPHY_DATA !== 'undefined' && PHILOSOPHY_DATA.books) ? PHILOSOPHY_DATA.books : [];
  try {
    const res = await fetch('/api/v1/books');
    if (res.ok) {
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.data || []);
      if (Array.isArray(data) && data.length > 0) {
        cachedBooks = data.map(b => {
          const localBook = masterBooks.find(x => x.id === (b.id || b.slug) || (b.slug && x.id === b.slug.toLowerCase()));
          return {
            ...localBook,
            ...b,
            id: b.id || b.slug || localBook?.id,
            title: b.title || localBook?.title,
            originalTitle: b.originalTitle || b.original_title || localBook?.originalTitle || '',
            author: b.author || localBook?.author,
            school: b.school || localBook?.school || 'Triết Học Cổ Điển',
            category: b.category_id || b.categoryId || (b.category ? b.category.slug : null) || b.category || localBook?.category || 'all',
            readTime: b.read_time || b.readTime || localBook?.readTime || '180 phút',
            audioDuration: b.audio_duration || b.audioDuration || localBook?.audioDuration || '4 giờ',
            coverImage: b.cover_image || b.coverImage || localBook?.coverImage || `assets/covers/${b.slug || b.id || 'suy-tuong'}.svg`,
            fallbackCover: b.fallback_cover || b.fallbackCover || localBook?.fallbackCover || `assets/covers/${b.slug || b.id || 'suy-tuong'}.svg`,
            bgmTheme: b.bgm_theme || b.bgmTheme || localBook?.bgmTheme || 'Giai điệu thiền tịnh thư phòng',
            rating: b.rating || localBook?.rating || 5.0,
            chaptersCount: b.chapters_count !== undefined ? b.chapters_count : (b.chapters ? b.chapters.length : (localBook?.chapters ? localBook.chapters.length : 12)),
            summary: b.summary || localBook?.summary || b.tagline || localBook?.tagline || 'Kiệt tác triết học kinh điển toàn văn.',
            tagline: b.tagline || localBook?.tagline || '',
            annotation: b.annotation || localBook?.annotation || b.summary || localBook?.summary || '',
            historicalContext: b.historical_context || b.historicalContext || localBook?.historicalContext || '',
            coreThesis: b.core_thesis || b.coreThesis || localBook?.coreThesis || '',
            modernRelevance: b.modern_relevance || b.modernRelevance || localBook?.modernRelevance || '',
            chapters: (b.chapters && b.chapters.length > 0) ? b.chapters : (localBook?.chapters || [])
          };
        });
        return cachedBooks;
      }
    }
  } catch (e) {}
  cachedBooks = masterBooks.map(b => ({
    ...b,
    chaptersCount: b.chapters ? b.chapters.length : 12
  }));
  return cachedBooks;
}

// 3. Render Books Grid với Bìa Bảo Tàng Thật & Khung Dát Vàng (Museum Edition)
async function renderBooksGrid(category = 'all', searchQuery = '') {
  const grid = document.getElementById('books-grid');
  if (!grid) return;

  const allBooks = await getBooksList();
  let filtered = allBooks;

  if (category !== 'all') {
    filtered = filtered.filter(b => b.category === category);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q) || 
      b.school.toLowerCase().includes(q)
    );
  }

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-stone-500 font-serif">
        <i data-lucide="compass" class="w-12 h-12 mx-auto text-amber-600/60 mb-3 animate-spin"></i>
        <p class="text-base font-medium">Không tìm thấy tác phẩm triết học phù hợp với từ khóa.</p>
        <button onclick="filterBooks('all')" class="mt-3 text-xs text-emerald-800 dark:text-amber-400 font-semibold underline">
          Xem lại tất cả tác phẩm
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  filtered.forEach(book => {
    const card = document.createElement('div');
    card.className = 'group bg-white dark:bg-[#111E17] rounded-3xl p-5 border border-stone-200/90 dark:border-emerald-900/60 shadow-sm hover:shadow-2xl transition-all duration-400 flex flex-col justify-between';

    const safeSummary = book.summary || book.tagline || 'Kiệt tác triết học kinh điển toàn văn.';
    const safeSchool = (book.school || 'Triết Học Cổ Điển').split('(')[0];

    card.innerHTML = `
      <div>
        <!-- Real Authentic Book Cover 3D Mockup -->
        <div class="real-book-cover mb-4 cursor-pointer relative" onclick="openBookReader('${book.id}')">
          ${book.accessLevel === 'PREMIUM' ? `<span class="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm">PREMIUM</span>` : ''}
          <div class="bookmark-ribbon"></div>
          <div class="book-foil-frame"></div>
          
          <img src="${book.coverImage}" 
               alt="${book.title}" 
               class="book-art"
               loading="lazy"
               onerror="this.onerror=null; this.src='${book.fallbackCover}'">

          <!-- Gold Plaque Typography -->
          <div class="book-title-plaque">
            <span class="inline-block px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-amber-500/30 text-amber-200 border border-amber-400/40 mb-1.5 font-display">
              ${safeSchool}
            </span>
            <h3 class="font-display font-bold text-base md:text-lg text-white leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
              ${book.title}
            </h3>
            <p class="text-[11px] text-amber-200/90 font-serif italic mt-0.5">${book.author} (${book.year})</p>
          </div>
        </div>

        <!-- Book Meta Details -->
        <div class="space-y-2.5">
          <!-- Audio & Soundscape Info Pill -->
          <div class="flex items-center justify-between text-[11px] bg-amber-500/10 dark:bg-amber-500/15 px-3 py-1 rounded-xl text-amber-900 dark:text-amber-300 font-medium border border-amber-600/20">
            <span class="flex items-center gap-1.5 truncate">
              <i data-lucide="music" class="w-3.5 h-3.5 text-amber-600"></i>
              <span>${book.bgmTheme}</span>
            </span>
            <span class="shrink-0 text-[10px] bg-emerald-950 text-amber-300 px-1.5 py-0.2 rounded font-bold">Studio Audio</span>
          </div>

          <div class="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span class="flex items-center gap-1 text-amber-600 font-semibold">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i> ${book.rating}
            </span>
            <span class="flex items-center gap-1">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i> ${book.chaptersCount || (book.chapters ? book.chapters.length : 12)} Chương
            </span>
            <span class="flex items-center gap-1">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${book.readTime}
            </span>
          </div>

          <h4 class="font-display font-bold text-stone-900 dark:text-stone-100 text-base leading-snug group-hover:text-emerald-900 dark:group-hover:text-amber-300 transition-colors cursor-pointer" onclick="openBookReader('${book.id}')">
            ${book.title}
          </h4>

          <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed font-ui">
            ${safeSummary}
          </p>

          <!-- Nút xem Chú Thích Tác Phẩm & Bối Cảnh Lịch Sử -->
          <div class="pt-1">
            <button onclick="event.stopPropagation(); openBookAnnotationModal('${book.id}')" 
                    class="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 flex items-center gap-1 transition-colors">
              <i data-lucide="file-text" class="w-3 h-3 text-amber-600"></i>
              <span>Xem chú thích & bối cảnh tác phẩm →</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-5 mt-4 border-t border-stone-100 dark:border-emerald-900/40 flex items-center gap-2">
        <button onclick="openBookReader('${book.id}')" 
                class="flex-1 bg-emerald-950 hover:bg-emerald-900 text-amber-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-amber-600/30">
          <i data-lucide="book-open" class="w-3.5 h-3.5 text-amber-300"></i> Đọc Toàn Văn
        </button>

        <button onclick="playBookAudio('${book.id}')" 
                title="Nghe Audio Thu Âm & Nhạc Nền"
                class="w-10 h-10 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 flex items-center justify-center transition-all border border-amber-600/30">
          <i data-lucide="headphones" class="w-4 h-4"></i>
        </button>

        <button onclick="openAIChatWithBook('${book.id}')" 
                title="Đàm đạo cùng Hiền Triết AI về sách này"
                class="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-all">
          <i data-lucide="sparkles" class="w-4 h-4 text-emerald-800 dark:text-amber-400"></i>
        </button>
      </div>
    `;

    grid.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

function filterBooks(catId) {
  const searchInput = document.getElementById('search-input');
  const query = searchInput ? searchInput.value.trim() : '';
  renderBooksGrid(catId, query);
}

// 4. Render Bức Tường Triết Gia Tiêu Biểu (Philosopher Wisdom Wall)
async function renderPhilosophers() {
  const container = document.getElementById('philosophers-container');
  if (!container) return;

  let philosophers = PHILOSOPHY_DATA.philosophers;
  try {
    const res = await fetch('/api/philosophers');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        philosophers = data.map(p => ({
          id: p.id,
          name: p.name,
          title: p.title,
          era: p.era,
          school: p.school,
          avatar: p.avatar,
          fallbackAvatar: p.fallback_avatar || p.fallbackAvatar || '',
          quote: p.quote,
          bio: p.bio,
          bookId: p.book_id || p.bookId || 'suy-tuong'
        }));
      }
    }
  } catch (e) {}

  container.innerHTML = '';
  philosophers.forEach(phil => {
    const card = document.createElement('div');
    card.className = 'flex flex-col justify-between p-4 rounded-3xl bg-white dark:bg-[#111E17] border border-stone-200/90 dark:border-emerald-900/60 shadow-sm hover:shadow-xl transition-all group shrink-0 w-64 md:w-72';
    
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="relative w-14 h-14 rounded-full p-1 border-2 border-amber-500/50 group-hover:border-amber-500 transition-all shadow-md overflow-hidden bg-stone-200 shrink-0">
            <img src="${phil.avatar}" 
                 alt="${phil.name}" 
                 class="w-full h-full object-cover rounded-full filter contrast-105"
                 onerror="this.onerror=null; this.src='${phil.fallbackAvatar}'">
          </div>
          <div>
            <h5 class="font-display font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-900 dark:group-hover:text-amber-300 transition-colors">
              ${phil.name}
            </h5>
            <span class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">${phil.school}</span>
            <p class="text-[10px] text-stone-400 font-mono">${phil.era}</p>
          </div>
        </div>

        <p class="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 italic mb-3 font-reading bg-stone-50 dark:bg-black/30 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-800">
          "${phil.quote}"
        </p>

        <p class="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
          ${phil.bio}
        </p>
      </div>

      <button onclick="openBookReader('${phil.bookId}')" 
              class="mt-3 w-full py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-emerald-950 hover:text-amber-300 transition-all flex items-center justify-center gap-1.5">
        <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Đọc Tác Phẩm
      </button>
    `;

    container.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

// 5. Render Daily Quote Card
async function renderDailyQuote() {
  const quoteText = document.getElementById('daily-quote-text');
  const quoteAuthor = document.getElementById('daily-quote-author');
  const quoteSchool = document.getElementById('daily-quote-school');

  if (!quoteText) return;

  // Ưu tiên nạp từ cơ sở dữ liệu SQLite qua API
  try {
    const res = await fetch('/api/overview');
    if (res.ok) {
      const data = await res.json();
      if (data.dailyQuote) {
        quoteText.textContent = `"${data.dailyQuote.quote}"`;
        if (quoteAuthor) quoteAuthor.textContent = data.dailyQuote.author;
        if (quoteSchool) quoteSchool.textContent = data.dailyQuote.school || 'Triết học';
        
        // Cập nhật số liệu header từ SQLite
        const countBooksEl = document.getElementById('stat-books-count');
        const countChapsEl = document.getElementById('stat-chapters-count');
        if (countBooksEl && data.kpis) countBooksEl.textContent = `${data.kpis.totalBooks} Tác Phẩm Toàn Văn`;
        if (countChapsEl && data.kpis) countChapsEl.textContent = `${data.kpis.totalChapters} Chương Kinh Điển`;
      }
    }
  } catch (e) {
    const quote = PHILOSOPHY_DATA.dailyQuotes[0];
    quoteText.textContent = `"${quote.quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = quote.author;
    if (quoteSchool) quoteSchool.textContent = quote.school;
  }

  document.getElementById('random-quote-btn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const quotes = await res.json();
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = `"${random.quote}"`;
        if (quoteAuthor) quoteAuthor.textContent = random.author;
        if (quoteSchool) quoteSchool.textContent = random.school;
        return;
      }
    } catch(e) {}
    const random = PHILOSOPHY_DATA.dailyQuotes[Math.floor(Math.random() * PHILOSOPHY_DATA.dailyQuotes.length)];
    quoteText.textContent = `"${random.quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = random.author;
    if (quoteSchool) quoteSchool.textContent = random.school;
  });

  document.getElementById('daily-quote-share-btn')?.addEventListener('click', () => {
    const text = quoteText.textContent.replace(/^"|"$/g, '').trim();
    const author = quoteAuthor ? quoteAuthor.textContent.trim() : 'Marcus Aurelius';
    const school = quoteSchool ? quoteSchool.textContent.trim() : 'Minh Triết Cổ Điển';
    if (window.quoteCardGen) {
      window.quoteCardGen.open(text, author, school);
    }
  });
}

// 6. Search (Desktop & Mobile & Keyboard Shortcut '/')
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const mobileSearchInput = document.getElementById('mobile-search-input');

  const handleSearch = (query) => {
    const activePill = document.querySelector('.category-pill.bg-emerald-950');
    const cat = activePill ? activePill.getAttribute('data-category') : 'all';
    renderBooksGrid(cat, query.trim());
  };

  searchInput?.addEventListener('input', (e) => {
    if (mobileSearchInput) mobileSearchInput.value = e.target.value;
    handleSearch(e.target.value);
  });

  mobileSearchInput?.addEventListener('input', (e) => {
    if (searchInput) searchInput.value = e.target.value;
    handleSearch(e.target.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== mobileSearchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
  });
}

// 7. Mobile Drawer and Nav
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('left-sidebar');
  const overlay = document.getElementById('mobile-overlay');

  const closeMenu = () => {
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  };

  menuToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('-translate-x-full');
    overlay?.classList.toggle('hidden');
  });

  overlay?.addEventListener('click', closeMenu);

  sidebar?.querySelectorAll('button, a').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        closeMenu();
      }
    });
  });
}

// Global actions
window.openBookReader = function(bookId) {
  if (window.readerEngine) {
    window.readerEngine.openBook(bookId, 0);
  }
};

window.playBookAudio = async function(bookId) {
  let book = null;
  try {
    const res = await fetch(`/api/v1/books/${bookId}`);
    if (res.ok) book = await res.json();
  } catch(e) {}
  if (!book) {
    book = PHILOSOPHY_DATA.books.find(b => b.id === bookId);
  }
  if (book && window.audioEngine) {
    window.audioEngine.loadChapter(book, 0, true);
    window.audioEngine.play();
  }
  if (book && window.bgmEngine) {
    window.bgmEngine.play(bookId);
  }
};

window.openAIChatWithBook = async function(bookId) {
  let book = null;
  try {
    const res = await fetch(`/api/v1/books/${bookId}`);
    if (res.ok) book = await res.json();
  } catch(e) {}
  if (!book) {
    book = PHILOSOPHY_DATA.books.find(b => b.id === bookId);
  }
  if (window.aiChat) {
    window.aiChat.openPanel();
    if (book) window.aiChat.setContext(book, book.chapters ? book.chapters[0] : null);
  }
};

/* ==========================================================================
   8. SIDEBAR NAVIGATION CONTROLLER (ĐIỀU HƯỚNG THƯ VIỆN ĐA TƯƠNG TÁC)
   Khắc phục toàn bộ trạng thái demo cho độc giả và quản trị viên
   ========================================================================== */

const SCHOOL_METADATA = {
  stoicism: {
    icon: '🏛️',
    title: 'Chủ Nghĩa Khắc Kỷ (Stoicism)',
    tag: 'Hy Lạp & La Mã Cổ Đại • 300 TCN – 180 SCN',
    quote: '"Không phải sự vật làm ta phiền lòng, mà chính cách ta phán đoán về chúng. Hãy giữ nội tâm vững chãi như bàn thạch giữa đại dương." — Epictetus & Marcus Aurelius'
  },
  eastern: {
    icon: '☯️',
    title: 'Minh Triết Phương Đông (Đạo Gia & Cổ Truyền)',
    tag: 'Đông Á Cổ Điển • Thế Kỷ 6 TCN',
    quote: '"Biết người là thông minh, biết mình mới là bậc đại giác ngộ. Thuận theo tự nhiên, vô vi mà không gì không làm." — Lão Tử (Đạo Đức Kinh)'
  },
  existentialism: {
    icon: '🔥',
    title: 'Chủ Nghĩa Hiện Sinh (Existentialism)',
    tag: 'Triết Học Hiện Đại • 1844 – 1950',
    quote: '"Kẻ nào có một lý do Tại sao để sống, kẻ đó có thể chịu đựng hầu như bất cứ điều Như thế nào nào." — Friedrich Nietzsche'
  },
  classical: {
    icon: '🏛️',
    title: 'Triết Học Cổ Điển Hy Lạp (Classical Greek)',
    tag: 'Cội Nguồn Triết Học Phương Tây • 428 – 348 TCN',
    quote: '"Một cuộc đời không có sự tự chất vấn và tự soi chiếu là một cuộc đời không đáng sống." — Socrates & Plato (Cộng Hòa)'
  },
  enlightenment: {
    icon: '🪶',
    title: 'Thời Kỳ Khai Sáng (Age of Enlightenment)',
    tag: 'Tư Tưởng Tự Do Cá Nhân • Thế Kỷ 18 – 19',
    quote: '"Tự do tư tưởng và tự do tranh luận là điều kiện tiên quyết cho sự tiến bộ của toàn thể nhân loại." — John Stuart Mill'
  }
};

window.selectSidebarMenu = function(menuId, shouldScroll = true) {
  // 1. Cập nhật trạng thái nút Sidebar được chọn
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-emerald-950', 'text-amber-200', 'font-semibold', 'shadow-sm', 'border-amber-600/30');
    btn.classList.add('text-stone-700', 'dark:text-stone-300', 'border-transparent');
    const icon = btn.querySelector('.nav-icon');
    if (icon) icon.classList.remove('text-amber-400');
  });

  const targetBtn = document.getElementById(`nav-btn-${menuId}`);
  if (targetBtn) {
    targetBtn.classList.remove('text-stone-700', 'dark:text-stone-300', 'border-transparent');
    targetBtn.classList.add('active', 'bg-emerald-950', 'text-amber-200', 'font-semibold', 'shadow-sm', 'border-amber-600/30');
    const icon = targetBtn.querySelector('.nav-icon');
    if (icon) icon.classList.add('text-amber-400');
  }

  // 2. Đồng bộ thanh thẻ lọc ngang (Category Pills)
  const categoryId = menuId === 'explore' ? 'all' : menuId;
  document.querySelectorAll('.category-pill').forEach(el => {
    if (el.getAttribute('data-category') === categoryId) {
      el.className = 'category-pill px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap bg-emerald-950 text-amber-300 shadow-md font-semibold ring-1 ring-amber-500/40';
    } else {
      el.className = 'category-pill px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/80 border border-stone-200/60 dark:border-stone-700 shadow-sm';
    }
  });

  // 3. Đóng trình đọc toàn văn nếu đang mở
  if (window.readerEngine && window.readerEngine.isOpen) {
    window.readerEngine.closeReader();
  }

  // 4. Lọc sách và hiển thị banner tương ứng
  if (menuId === 'explore') {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    hideSchoolBanner();
    renderBooksGrid('all');
    if (shouldScroll) {
      document.getElementById('view-catalog')?.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    showSchoolBanner(menuId);
    renderBooksGrid(menuId);
    if (shouldScroll) {
      document.getElementById('books-grid-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (window.lucide) window.lucide.createIcons();
};

window.showSchoolBanner = function(schoolId) {
  const banner = document.getElementById('school-spotlight-banner');
  const info = SCHOOL_METADATA[schoolId];
  if (!banner || !info) return;

  const iconEl = document.getElementById('school-banner-icon');
  const titleEl = document.getElementById('school-banner-title');
  const tagEl = document.getElementById('school-banner-tag');
  const quoteEl = document.getElementById('school-banner-quote');

  if (iconEl) iconEl.textContent = info.icon;
  if (titleEl) titleEl.textContent = info.title;
  if (tagEl) tagEl.textContent = `• ${info.tag}`;
  if (quoteEl) quoteEl.textContent = info.quote;

  banner.classList.remove('hidden');
};

window.hideSchoolBanner = function() {
  const banner = document.getElementById('school-spotlight-banner');
  if (banner) banner.classList.add('hidden');
};

/* ==========================================================================
   9. SOPHIA AUDIO STUDIO (PHÒNG THU SÁCH NÓI TOÀN VĂN & ÂM HƯỞNG KHÔNG GIAN)
   ========================================================================== */

let currentStudioBookId = 'suy-tuong';

window.openAudioStudioModal = function() {
  const modal = document.getElementById('audio-studio-modal');
  if (!modal) return;

  // Đổi trạng thái active trên sidebar
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-emerald-950', 'text-amber-200', 'font-semibold', 'shadow-sm', 'border-amber-600/30');
    btn.classList.add('text-stone-700', 'dark:text-stone-300', 'border-transparent');
    const icon = btn.querySelector('.nav-icon');
    if (icon) icon.classList.remove('text-amber-400');
  });
  const audioBtn = document.getElementById('nav-btn-audio');
  if (audioBtn) {
    audioBtn.classList.remove('text-stone-700', 'dark:text-stone-300', 'border-transparent');
    audioBtn.classList.add('active', 'bg-emerald-950', 'text-amber-200', 'font-semibold', 'shadow-sm', 'border-amber-600/30');
    const icon = audioBtn.querySelector('.nav-icon');
    if (icon) icon.classList.add('text-amber-400');
  }

  // Khởi tạo danh mục tác phẩm và track
  renderStudioAudiobooksGrid();
  updateStudioTrackInfo(currentStudioBookId);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
};

window.closeAudioStudioModal = function() {
  const modal = document.getElementById('audio-studio-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
};

function renderStudioAudiobooksGrid() {
  const grid = document.getElementById('studio-audiobooks-grid');
  if (!grid) return;

  const books = [
    { id: 'suy-tuong', title: 'Suy Tưởng', author: 'Marcus Aurelius', school: 'Khắc Kỷ', cover: 'assets/covers/suy-tuong.svg', chapters: '12 Quyển' },
    { id: 'dao-duc-kinh', title: 'Đạo Đức Kinh', author: 'Lão Tử', school: 'Đạo Gia', cover: 'assets/covers/dao-duc-kinh.svg', chapters: '81 Chương' },
    { id: 'zarathustra', title: 'Zarathustra', author: 'F. Nietzsche', school: 'Hiện Sinh', cover: 'assets/covers/zarathustra.svg', chapters: '4 Phần' },
    { id: 'cong-hoa', title: 'Cộng Hòa', author: 'Plato', school: 'Cổ Điển', cover: 'assets/covers/cong-hoa.svg', chapters: '10 Quyển' },
    { id: 'ban-ve-tu-do', title: 'Bàn Về Tự Do', author: 'J.S. Mill', school: 'Khai Sáng', cover: 'assets/covers/ban-ve-tu-do.svg', chapters: '5 Chương' }
  ];

  grid.innerHTML = books.map(b => {
    const isCurrent = b.id === currentStudioBookId;
    return `
      <div onclick="selectStudioBook('${b.id}')" class="p-2.5 rounded-xl border ${isCurrent ? 'border-amber-500 bg-amber-500/15' : 'border-emerald-900/40 bg-black/30 hover:bg-white/5'} cursor-pointer transition-all flex items-center gap-2.5 group">
        <img src="${b.cover}" alt="${b.title}" class="w-10 h-14 rounded-lg object-cover shrink-0 shadow-md border border-amber-600/30">
        <div class="min-w-0 flex-1">
          <h6 class="text-xs font-bold truncate text-white group-hover:text-amber-300 transition-colors">${b.title}</h6>
          <p class="text-[10px] text-stone-400 truncate">${b.author}</p>
          <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-amber-300 border border-amber-500/30 font-mono mt-1 inline-block">${b.chapters}</span>
        </div>
      </div>
    `;
  }).join('');
}

window.selectStudioBook = function(bookId) {
  currentStudioBookId = bookId;
  updateStudioTrackInfo(bookId);
  renderStudioAudiobooksGrid();

  const book = PHILOSOPHY_DATA.books.find(b => b.id === bookId);
  if (book && window.audioEngine) {
    window.audioEngine.loadChapter(book, 0, true);
    window.audioEngine.play();
  }
  if (window.bgmEngine) {
    window.bgmEngine.play(bookId);
  }
  updateStudioPlayState(true);
};

function updateStudioTrackInfo(bookId) {
  const book = PHILOSOPHY_DATA.books.find(b => b.id === bookId) || PHILOSOPHY_DATA.books[0];
  if (!book) return;

  const coverImg = document.getElementById('studio-cover-img');
  const titleEl = document.getElementById('studio-book-title');
  const chapterEl = document.getElementById('studio-chapter-title');
  const schoolEl = document.getElementById('studio-book-school');
  const syncedTextEl = document.getElementById('studio-synced-text');
  const soundscapeSelect = document.getElementById('studio-soundscape-select');

  if (coverImg) coverImg.src = book.coverImage || `assets/covers/${book.id}.svg`;
  if (titleEl) titleEl.textContent = book.title;
  if (chapterEl) chapterEl.textContent = book.chapters && book.chapters[0] ? `${book.chapters[0].number || 'Chương 1'}: ${book.chapters[0].title || ''}` : 'Chương 1: Khởi Đầu Chiêm Nghiệm';
  if (schoolEl) schoolEl.textContent = book.school ? book.school.split('(')[0] : 'Minh Triết';
  if (soundscapeSelect) soundscapeSelect.value = book.id;

  const sampleParagraphs = {
    'suy-tuong': '"Không phải sự vật bên ngoài làm phiền lòng bạn, mà chính là phán đoán của bạn về chúng. Và bạn có đủ quyền năng xóa bỏ phán đoán đó ngay lúc này để giữ tâm hồn thanh thản."',
    'dao-duc-kinh': '"Đạo sinh nhất, nhất sinh nhị, nhị sinh tam, tam sinh vạn vật. Vạn vật phụ âm nhi bảo dương, xung khí dĩ vi hòa. Thuận theo lẽ tự nhiên, không cưỡng cầu."',
    'zarathustra': '"Kẻ nào có một lý do Tại sao để sống, kẻ đó có thể chịu đựng hầu như bất cứ điều Như thế nào nào. Con người là một sợi dây nối giữa loài vật và Siêu nhân."',
    'cong-hoa': '"Cái thiện là cội nguồn của mọi chân lý và tri thức. Người cai trị lý tưởng phải là người yêu mến sự thông thái và phụng sự công lý."',
    'ban-ve-tu-do': '"Tự do duy nhất xứng đáng với tên gọi đó là được theo đuổi điều tốt đẹp theo cách riêng của mình, miễn là chúng ta không tước đoạt điều đó của người khác."'
  };
  if (syncedTextEl) syncedTextEl.textContent = sampleParagraphs[bookId] || sampleParagraphs['suy-tuong'];
}

window.studioTogglePlay = function() {
  if (window.audioEngine) {
    if (window.audioEngine.isPlaying) {
      window.audioEngine.pause();
      if (window.bgmEngine) window.bgmEngine.pause();
      updateStudioPlayState(false);
    } else {
      const book = PHILOSOPHY_DATA.books.find(b => b.id === currentStudioBookId) || PHILOSOPHY_DATA.books[0];
      if (!window.audioEngine.currentBook) {
        window.audioEngine.loadChapter(book, 0, true);
      }
      window.audioEngine.play();
      if (window.bgmEngine) window.bgmEngine.play(currentStudioBookId);
      updateStudioPlayState(true);
    }
  } else {
    const vinyl = document.getElementById('studio-vinyl-disc');
    const isPaused = vinyl && vinyl.style.animationPlayState === 'paused';
    updateStudioPlayState(isPaused);
  }
};

function updateStudioPlayState(isPlaying) {
  const vinyl = document.getElementById('studio-vinyl-disc');
  const playIcon = document.getElementById('studio-main-play-icon');
  const playText = document.getElementById('studio-main-play-text');

  if (vinyl) {
    vinyl.style.animationPlayState = isPlaying ? 'running' : 'paused';
  }
  if (playText) {
    playText.textContent = isPlaying ? 'Tạm Dừng' : 'Phát Audio';
  }
  if (playIcon) {
    playIcon.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
    if (window.lucide) window.lucide.createIcons();
  }
}

window.studioSeek = function(delta) {
  if (window.audioEngine) window.audioEngine.seek(delta);
};

let currentStudioSpeed = 1.0;
window.studioCycleSpeed = function() {
  const speeds = [0.8, 1.0, 1.25, 1.5];
  const nextIdx = (speeds.indexOf(currentStudioSpeed) + 1) % speeds.length;
  currentStudioSpeed = speeds[nextIdx];
  const btn = document.getElementById('studio-speed-btn');
  if (btn) btn.textContent = `${currentStudioSpeed}x`;
  if (window.audioEngine) {
    window.audioEngine.playbackRate = currentStudioSpeed * 0.86;
    if (window.audioEngine.studioAudio) window.audioEngine.studioAudio.playbackRate = currentStudioSpeed;
  }
};

window.setStudioVoiceMode = function(mode) {
  const btnPod = document.getElementById('voice-mode-podcast');
  const btnTts = document.getElementById('voice-mode-tts');

  if (mode === 'studio') {
    if (btnPod) btnPod.className = 'p-3 rounded-xl bg-emerald-950 border-2 border-amber-500/60 text-amber-200 font-semibold text-left transition-all';
    if (btnTts) btnTts.className = 'p-3 rounded-xl bg-black/30 border border-white/10 text-stone-300 hover:text-white font-medium text-left transition-all';
  } else {
    if (btnTts) btnTts.className = 'p-3 rounded-xl bg-emerald-950 border-2 border-amber-500/60 text-amber-200 font-semibold text-left transition-all';
    if (btnPod) btnPod.className = 'p-3 rounded-xl bg-black/30 border border-white/10 text-stone-300 hover:text-white font-medium text-left transition-all';
  }

  if (window.audioEngine) {
    window.audioEngine.playbackMode = mode;
  }
};

window.changeStudioSoundscape = function(bookId) {
  if (window.bgmEngine) {
    window.bgmEngine.play(bookId);
  }
};

window.toggleStudioBGM = function() {
  const btn = document.getElementById('studio-bgm-toggle-btn');
  if (window.bgmEngine) {
    if (window.bgmEngine.isPlaying) {
      window.bgmEngine.pause();
      if (btn) btn.textContent = 'Đã Tắt';
    } else {
      window.bgmEngine.play(currentStudioBookId);
      if (btn) btn.textContent = 'Đang Bật';
    }
  }
};

window.setStudioBGMVolume = function(val) {
  if (window.bgmEngine) {
    window.bgmEngine.setVolume(parseFloat(val));
  }
};

window.handleStudioScrub = function(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const fill = document.getElementById('studio-progress-fill');
  if (fill) fill.style.width = `${pct * 100}%`;
  if (window.audioEngine && window.audioEngine.studioAudio && window.audioEngine.studioAudio.duration) {
    window.audioEngine.studioAudio.currentTime = pct * window.audioEngine.studioAudio.duration;
  }
};

window.openBookFromStudio = function() {
  closeAudioStudioModal();
  openBookReader(currentStudioBookId);
};

/* ==========================================================================
   10. SOPHIA PREMIUM MEMBERSHIP CONTROLLER
   ========================================================================== */

let currentModalPlan = 'month';
let currentActiveOrder = null;

function getLoggedInUser() {
  if (typeof Auth !== 'undefined' && Auth.getUser && Auth.getUser()) {
    return Auth.getUser();
  }
  try {
    const raw = localStorage.getItem('sophia_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.email || u.id)) return u;
    }
  } catch(e) {}
  return null;
}

window.openSophiaPremiumModal = function() {
  const modal = document.getElementById('premium-modal');
  if (!modal) return;

  const user = getLoggedInUser();

  const stepAuthRequired = document.getElementById('modal-step-auth-required');
  const stepPlans = document.getElementById('modal-step-plans');
  const stepPayment = document.getElementById('modal-step-payment');
  const stepReceipt = document.getElementById('modal-step-receipt');

  // Reset các bước
  if (stepPayment) stepPayment.classList.add('hidden');
  if (stepReceipt) stepReceipt.classList.add('hidden');

  if (!user) {
    // CHƯA ĐĂNG NHẬP: Bắt buộc đăng ký hoặc đăng nhập mới được mua gói
    if (stepAuthRequired) stepAuthRequired.classList.remove('hidden');
    if (stepPlans) stepPlans.classList.add('hidden');
  } else {
    // ĐÃ ĐĂNG NHẬP: Hiển thị form chọn gói & thông tin tài khoản
    if (stepAuthRequired) stepAuthRequired.classList.add('hidden');
    if (stepPlans) stepPlans.classList.remove('hidden');

    // Tự động điền thông tin tài khoản đã đăng nhập
    const nameInput = document.getElementById('modal-cust-name');
    const emailInput = document.getElementById('modal-cust-email');
    if (nameInput) nameInput.value = user.displayName || user.name || '';
    if (emailInput) {
      emailInput.value = user.email || '';
      emailInput.readOnly = true; // Khóa email để gắn chặt với tài khoản đã đăng nhập
    }

    // Hiển thị badge quyền hạn nếu có
    const badge = document.getElementById('premium-status-badge');
    const badgeText = document.getElementById('premium-status-text');
    const adminLink = document.getElementById('btn-admin-portal-link');

    if (user.isSuperAdmin) {
      if (badge) badge.classList.remove('hidden');
      if (badgeText) badgeText.textContent = 'Tài khoản Quản Trị Viên sở hữu toàn quyền Premium vĩnh viễn.';
      if (adminLink) adminLink.classList.remove('hidden');
    } else if (user.isPremium) {
      if (badge) badge.classList.remove('hidden');
      if (badgeText) badgeText.textContent = 'Bạn hiện đang là Hội viên Sophia Premium.';
      if (adminLink) adminLink.classList.add('hidden');
    } else {
      if (badge) badge.classList.add('hidden');
      if (adminLink) adminLink.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
};

window.closePremiumModal = function() {
  const modal = document.getElementById('premium-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
};

window.toggleModalPlan = function(plan) {
  currentModalPlan = plan;
  const btnMonth = document.getElementById('modal-plan-month-btn');
  const btnYear = document.getElementById('modal-plan-year-btn');
  if (plan === 'month') {
    if (btnMonth) btnMonth.className = 'flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-950 text-amber-200 shadow-sm border border-amber-500/30 transition-all';
    if (btnYear) btnYear.className = 'flex-1 py-2 text-xs font-medium rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 transition-all';
  } else {
    if (btnYear) btnYear.className = 'flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-950 text-amber-200 shadow-sm border border-amber-500/30 transition-all';
    if (btnMonth) btnMonth.className = 'flex-1 py-2 text-xs font-medium rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 transition-all';
  }
};

window.proceedToPaymentStep = async function() {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = 'login.html?next=pricing.html';
    return;
  }

  const nameInput = document.getElementById('modal-cust-name');
  const phoneInput = document.getElementById('modal-cust-phone');
  const emailInput = document.getElementById('modal-cust-email');
  const errorEl = document.getElementById('modal-step1-error');

  const fullName = nameInput ? nameInput.value.trim() : (user.displayName || '');
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : user.email;

  if (!fullName) {
    if (errorEl) {
      errorEl.textContent = 'Vui lòng nhập họ và tên của Quý độc giả.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (!phone || phone.length < 8) {
    if (errorEl) {
      errorEl.textContent = 'Vui lòng nhập số điện thoại hoặc Zalo để phục vụ đối soát giao dịch.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');

  const planCode = currentModalPlan === 'month' ? 'PREMIUM_1M' : 'PREMIUM_1Y';
  const planName = currentModalPlan === 'month' ? 'Sophia Premium - Gói Tháng' : 'Sophia Premium - Gói Năm (Tiết kiệm 32%)';
  const amountVnd = currentModalPlan === 'month' ? 49000 : 399000;
  const formattedAmount = currentModalPlan === 'month' ? '49.000đ' : '399.000đ';

  const orderCode = typeof SOPHIA_PAYMENT !== 'undefined' ? SOPHIA_PAYMENT.generateOrderCode() : ('SC-' + Date.now().toString().slice(-8));
  const vietQrUrl = typeof SOPHIA_PAYMENT !== 'undefined' ? SOPHIA_PAYMENT.getVietQrUrl(orderCode, amountVnd) : `https://img.vietqr.io/image/MB-0388688999-compact2.png?amount=${amountVnd}&addInfo=${orderCode}&accountName=VU%20SI%20TIEN`;

  currentActiveOrder = {
    orderCode,
    planCode,
    planName,
    amountVnd,
    formattedAmount,
    customerName: fullName,
    customerPhone: phone,
    customerEmail: email,
    vietQrUrl,
    createdAt: new Date().toISOString()
  };

  if (typeof SOPHIA_PAYMENT !== 'undefined') {
    SOPHIA_PAYMENT.saveLocalOrder(currentActiveOrder);
  }

  // Gửi tạo đơn lên server
  try {
    if (typeof API !== 'undefined' && API.post) {
      await API.post('/payments/checkout', {
        planCode,
        provider: 'VIETQR',
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email
      });
    }
  } catch(e) {
    console.warn('API checkout notice:', e.message);
  }

  // Cập nhật giao diện Bước 2
  const payOrderCode = document.getElementById('modal-pay-order-code');
  const payPlanName = document.getElementById('modal-pay-plan-name');
  const payAmount = document.getElementById('modal-pay-amount');
  const payCopyAmount = document.getElementById('modal-pay-copy-amount');
  const paySyntax = document.getElementById('modal-pay-transfer-syntax');
  const qrImg = document.getElementById('modal-vietqr-img');

  if (payOrderCode) payOrderCode.textContent = orderCode;
  if (payPlanName) payPlanName.textContent = planName;
  if (payAmount) payAmount.textContent = formattedAmount;
  if (payCopyAmount) payCopyAmount.textContent = formattedAmount;
  if (paySyntax) paySyntax.textContent = orderCode;
  if (qrImg) qrImg.src = vietQrUrl;

  document.getElementById('modal-step-plans').classList.add('hidden');
  document.getElementById('modal-step-payment').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
};

window.backToPlanStep = function() {
  document.getElementById('modal-step-payment').classList.add('hidden');
  document.getElementById('modal-step-plans').classList.remove('hidden');
};

window.copyAmountText = function() {
  if (currentActiveOrder && typeof SOPHIA_PAYMENT !== 'undefined') {
    SOPHIA_PAYMENT.copyToClipboard(String(currentActiveOrder.amountVnd), 'Đã sao chép số tiền: ' + currentActiveOrder.formattedAmount);
  }
};

window.copySyntaxText = function() {
  if (currentActiveOrder && typeof SOPHIA_PAYMENT !== 'undefined') {
    SOPHIA_PAYMENT.copyToClipboard(currentActiveOrder.orderCode, 'Đã sao chép cú pháp chuyển khoản: ' + currentActiveOrder.orderCode);
  }
};

window.submitPaymentVerification = async function() {
  const refInput = document.getElementById('modal-pay-ref-input');
  const btn = document.getElementById('btn-submit-verify');

  const refCode = refInput ? refInput.value.trim() : '';

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> <span>Đang ghi nhận xác thực...</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    if (typeof API !== 'undefined' && currentActiveOrder) {
      await API.post(`/payments/orders/${currentActiveOrder.orderCode}/verify`, {
        transactionRef: refCode || 'REF_' + Date.now(),
        customerPhone: currentActiveOrder.customerPhone,
        senderNote: 'Chuyển khoản gói ' + currentActiveOrder.planName
      });
    }
  } catch(e) {
    console.warn('Verify API notice:', e.message);
  }

  // Cập nhật giao diện Bước 3 (Biên lai điện tử)
  const rCode = document.getElementById('receipt-order-code');
  const rName = document.getElementById('receipt-cust-name');
  const rEmail = document.getElementById('receipt-cust-email');
  const rPlan = document.getElementById('receipt-plan-name');
  const rAmount = document.getElementById('receipt-amount');
  const rZalo = document.getElementById('receipt-zalo-link');

  if (currentActiveOrder) {
    if (rCode) rCode.textContent = currentActiveOrder.orderCode;
    if (rName) rName.textContent = currentActiveOrder.customerName;
    if (rEmail) rEmail.textContent = currentActiveOrder.customerEmail;
    if (rPlan) rPlan.textContent = currentActiveOrder.planName;
    if (rAmount) rAmount.textContent = currentActiveOrder.formattedAmount;
    if (rZalo) rZalo.href = `https://zalo.me/0388688999?text=${encodeURIComponent('Xác nhận kích hoạt đơn hàng: ' + currentActiveOrder.orderCode + ' (' + currentActiveOrder.customerEmail + ')')}`;
  }

  document.getElementById('modal-step-payment').classList.add('hidden');
  document.getElementById('modal-step-receipt').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
};

/* ==========================================================================
   11. ADMIN GATEWAY CONTROLLER (CỔNG XƯỞNG QUẢN TRỊ)
   Dành riêng cho Quản Trị Viên (SuperAdmin)
   ========================================================================== */

window.handleAdminEntryClick = function(event) {
  if (event) event.preventDefault();
  let user = null;
  try {
    const u = localStorage.getItem('sophia_user');
    if (u) user = JSON.parse(u);
  } catch(e) {}

  const isAdmin = user && (
    user.isSuperAdmin === true ||
    (Array.isArray(user.permissions) && (user.permissions.includes('*') || user.permissions.includes('admin'))) ||
    user.email === 'admin@sophiacodex.vn'
  );

  if (isAdmin) {
    window.location.href = 'admin.html';
  } else if (!user) {
    sessionStorage.setItem('auth_redirect_msg', 'Vui lòng đăng nhập tài khoản Quản trị để tiếp tục.');
    window.location.href = 'login.html?next=admin.html';
  } else {
    if (typeof Toast !== 'undefined') {
      Toast.error('Khu vực này chỉ dành riêng cho Quản trị viên (Admin). Tài khoản Độc giả không có quyền truy cập.');
    } else {
      alert('Khu vực này chỉ dành riêng cho Quản trị viên (Admin). Tài khoản Độc giả không có quyền truy cập.');
    }
  }
};

/* ==========================================================================
   12. BOOK ANNOTATION & HISTORICAL CONTEXT MODAL
   Chú Thích Tác Phẩm & Bối Cảnh Lịch Sử Chi Tiết
   ========================================================================== */

window.openBookAnnotationModal = async function(bookId) {
  const books = await getBooksList();
  const book = books.find(b => b.id === bookId || b.slug === bookId) || 
               (typeof PHILOSOPHY_DATA !== 'undefined' ? PHILOSOPHY_DATA.books.find(b => b.id === bookId) : null);
  if (!book) return;

  let modal = document.getElementById('book-annotation-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'book-annotation-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';
    document.body.appendChild(modal);
  }

  const safeTitle = book.title || 'Tác Phẩm Triết Học';
  const safeAuthor = book.author || 'Hiền Triết';
  const safeSchool = (book.school || 'Triết Học Cổ Điển').split('(')[0];
  const safeYear = book.year || '';
  const safeSummary = book.summary || book.tagline || 'Kiệt tác triết học kinh điển toàn văn.';
  const safeHistory = book.historicalContext || 'Tác phẩm được đúc kết từ bối cảnh văn hóa và triết học sâu sắc của nhân loại.';
  const safeThesis = book.coreThesis || book.tagline || 'Khảo sát bản chất của con người và vũ trụ.';
  const safeRelevance = book.modernRelevance || 'Cung cấp bài học thực tiễn giúp cân bằng tâm trí và phát triển bản thân.';

  modal.innerHTML = `
    <div class="bg-[#FAF7F2] dark:bg-[#111E17] border border-amber-600/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 relative text-stone-800 dark:text-stone-100 font-sans">
      <!-- Close button -->
      <button onclick="closeBookAnnotationModal()" 
              class="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-200/80 dark:bg-emerald-950 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-300 transition-colors">
        ✕
      </button>

      <!-- Header with Cover thumbnail -->
      <div class="flex items-start gap-4 pr-8">
        <img src="${book.coverImage || 'assets/covers/suy-tuong.svg'}" 
             alt="${safeTitle}" 
             class="w-16 h-24 object-cover rounded-xl shadow-md border border-amber-500/30 shrink-0">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 mb-1">
            ${safeSchool}
          </span>
          <h3 class="font-display font-bold text-xl md:text-2xl text-stone-900 dark:text-amber-100 leading-tight">
            ${safeTitle}
          </h3>
          <p class="text-xs text-amber-700 dark:text-amber-300 font-serif italic mt-0.5">${safeAuthor} ${safeYear ? `(${safeYear})` : ''}</p>
        </div>
      </div>

      <!-- Content sections -->
      <div class="space-y-4 text-xs md:text-sm leading-relaxed">
        <!-- 1. Tóm Lược & Chú Thích Tổng Quan -->
        <div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/30 space-y-1.5">
          <h4 class="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <span class="text-base">📜</span> Lời Giới Thiệu & Chú Thích Tác Phẩm
          </h4>
          <p class="text-stone-700 dark:text-stone-300 leading-relaxed">${safeSummary}</p>
        </div>

        <!-- 2. Hoàn Cảnh Lịch Sử & Bối Cảnh Ra Đời -->
        <div class="p-4 rounded-2xl bg-white dark:bg-[#0A160F] border border-stone-200 dark:border-emerald-900/60 space-y-1.5 shadow-sm">
          <h4 class="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <span class="text-base">🏛️</span> Bối Cảnh Lịch Sử & Hoàn Cảnh Ra Đời
          </h4>
          <p class="text-stone-600 dark:text-stone-300 leading-relaxed">${safeHistory}</p>
        </div>

        <!-- 3. Luận Điểm Triết Học Cốt Lõi -->
        <div class="p-4 rounded-2xl bg-white dark:bg-[#0A160F] border border-stone-200 dark:border-emerald-900/60 space-y-1.5 shadow-sm">
          <h4 class="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <span class="text-base">💡</span> Luận Điểm Triết Học Cốt Lõi
          </h4>
          <p class="text-stone-600 dark:text-stone-300 leading-relaxed">${safeThesis}</p>
        </div>

        <!-- 4. Ứng Dụng Thực Tiễn -->
        <div class="p-4 rounded-2xl bg-white dark:bg-[#0A160F] border border-stone-200 dark:border-emerald-900/60 space-y-1.5 shadow-sm">
          <h4 class="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <span class="text-base">🎯</span> Giá Trị & Ứng Dụng Thực Tiễn Hiện Đại
          </h4>
          <p class="text-stone-600 dark:text-stone-300 leading-relaxed">${safeRelevance}</p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="pt-2 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-emerald-900/60">
        <button onclick="closeBookAnnotationModal()" 
                class="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-emerald-900 transition-colors">
          Đóng
        </button>
        <button onclick="closeBookAnnotationModal(); openBookReader('${book.id}')" 
                class="px-6 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-200 font-semibold text-xs border border-amber-600/30 flex items-center gap-2 shadow-md transition-all">
          <span>Đọc Toàn Văn Ngay</span> →
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.onclick = (e) => {
    if (e.target === modal) closeBookAnnotationModal();
  };
};

window.closeBookAnnotationModal = function() {
  const modal = document.getElementById('book-annotation-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

