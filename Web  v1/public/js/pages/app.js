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
      document.querySelectorAll('.category-pill').forEach(el => {
        el.className = 'category-pill px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/80 border border-stone-200/60 dark:border-stone-700 shadow-sm';
      });
      btn.className = 'category-pill px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap bg-emerald-950 text-amber-300 shadow-md font-semibold ring-1 ring-amber-500/40';
      filterBooks(cat.id);
      if (window.lucide) window.lucide.createIcons();
    });

    container.appendChild(btn);
  });
}

let cachedBooks = null;

async function getBooksList() {
  if (cachedBooks) return cachedBooks;
  try {
    const res = await fetch('/api/v1/books');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedBooks = data.map(b => ({
          ...b,
          category: b.category_id || b.category || 'all',
          readTime: b.read_time || b.readTime || '15 phút đọc',
          coverImage: b.cover_image || b.coverImage,
          fallbackCover: b.fallback_cover || b.fallbackCover || '',
          bgmTheme: b.bgm_theme || b.bgmTheme || 'Nhạc Thiền Tĩnh Lặng',
          rating: b.rating || 4.9,
          chaptersCount: b.chapters_count !== undefined ? b.chapters_count : (b.chapters ? b.chapters.length : 12),
          chapters: b.chapters || []
        }));
        return cachedBooks;
      }
    }
  } catch (e) {}
  cachedBooks = PHILOSOPHY_DATA.books.map(b => ({
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
              ${book.school.split('(')[0]}
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
            ${book.summary}
          </p>
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
