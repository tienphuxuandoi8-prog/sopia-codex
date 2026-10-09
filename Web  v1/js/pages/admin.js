/**
 * SOPHIA CODEX - ADMIN DASHBOARD CLIENT CONTROLLER
 * Tương tác trực tiếp với REST API & Động cơ SQLite (node:sqlite)
 */

// Global State
let currentOverviewData = null;
let allBooksCache = [];
let currentBookFilter = 'all';
let currentSelectedBookId = null;
let currentBookChaptersCache = [];

let allQuotesCache = [];
let currentQuoteFilter = 'all';
let adminCardQuoteId = null;
let adminCardFormat = 'feed';
let adminCardTheme = 'navy';
let adminCardQuoteText = '';
let adminCardAuthor = '';
let adminCardBook = '';

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadOverviewDashboard();
  initShortcuts();
  initSearch();
  initModalBackdropDismiss();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * =========================================================================
 * 1. BẢNG ĐIỀU KHIỂN TỔNG QUAN (OVERVIEW DASHBOARD)
 * =========================================================================
 */
async function loadOverviewDashboard() {
  try {
    const res = await fetch('/api/overview');
    if (!res.ok) throw new Error('Không thể tải dữ liệu API');
    const data = await res.json();
    currentOverviewData = data;

    renderOverviewKPIs(data.kpis);
    renderTopBooks(data.topBooks);
    renderSchoolDistribution(data.schoolDistribution);
    renderRecentAiQuestions(data.recentAiQuestions);
    renderDailyQuote(data.dailyQuote);
    renderDbStatusBadge(data.dbHealth);

    // Cập nhật số lượng trên sidebar
    const booksCountEl = document.getElementById('sidebar-books-count');
    const chaptersCountEl = document.getElementById('sidebar-chapters-count');
    if (booksCountEl) booksCountEl.textContent = data.kpis.totalBooks;
    if (chaptersCountEl) chaptersCountEl.textContent = data.kpis.totalChapters;

    // Cập nhật ngầm danh sách sách để sẵn sàng cho dropdown
    preloadBooks();

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Lỗi khi nạp dữ liệu Admin:', err);
    showToast('⚠️ Không thể kết nối API SQLite. Đang thử lại...');
  }
}

/**
 * Render 6 thẻ KPI
 */
function renderOverviewKPIs(kpis) {
  if (!kpis) return;
  const bEl = document.getElementById('kpi-books-count');
  const cEl = document.getElementById('kpi-chapters-count');
  const hEl = document.getElementById('kpi-reading-hours');
  const sEl = document.getElementById('kpi-shares-count');
  const audioEl = document.getElementById('kpi-audio-hours');
  const readersEl = document.getElementById('kpi-readers-count');

  if (bEl) bEl.textContent = kpis.totalBooks || 0;
  if (cEl) cEl.textContent = kpis.totalChapters || 0;
  if (hEl) hEl.textContent = kpis.deepReadingHours || '0';
  if (sEl) sEl.textContent = kpis.totalShares || 0;
  if (audioEl) audioEl.textContent = kpis.deepReadingHours ? (parseFloat(kpis.deepReadingHours) * 0.9).toFixed(1) : '12.5';
  if (readersEl) readersEl.textContent = kpis.activeReaders || '68,400+';
}

/**
 * Render Top Tác Phẩm Được Đọc Nhiều Nhất
 */
function renderTopBooks(topBooks) {
  const container = document.getElementById('top-books-container');
  if (!container) return;

  if (!topBooks || topBooks.length === 0) {
    container.innerHTML = '<p class="text-xs text-stone-400 italic">Chưa có dữ liệu phiên đọc.</p>';
    return;
  }

  const maxSeconds = Math.max(...topBooks.map(b => b.total_seconds || 1));

  container.innerHTML = topBooks.map((b, idx) => {
    const hours = ((b.total_seconds || 0) / 3600).toFixed(1);
    const percent = Math.min(100, Math.round(((b.total_seconds || 0) / maxSeconds) * 100));
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

    return `
      <div class="p-3 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/80 dark:border-emerald-800/40 flex items-center justify-between gap-4 hover:border-amber-500/40 transition-all">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <span class="w-7 text-center font-bold text-xs text-stone-500 font-mono">${medal}</span>
          <img src="${b.cover_image || 'assets/covers/suy-tuong.svg'}" alt="${b.title}" class="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0 border border-stone-200 dark:border-emerald-800">
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-xs md:text-sm text-stone-900 dark:text-stone-100 truncate">${b.title}</h4>
            <div class="text-[11px] text-stone-500 truncate">${b.author} • <span class="text-amber-700 dark:text-amber-400 font-medium">${b.school}</span></div>
            <!-- Progress Bar -->
            <div class="w-full h-1.5 bg-stone-200 dark:bg-emerald-900 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
            </div>
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="font-bold text-xs text-stone-900 dark:text-amber-300 tabular-nums">${hours} giờ</div>
          <div class="text-[10px] text-stone-400">${b.sessions_count || 0} phiên đọc sâu</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render Cơ Cấu Phân Bố Trường Phái
 */
function renderSchoolDistribution(schools) {
  const container = document.getElementById('school-distribution-container');
  if (!container) return;

  const validSchools = (schools || []).filter(s => s.name !== 'Tất cả trường phái');
  const total = validSchools.reduce((acc, s) => acc + (s.book_count || 0), 0) || 1;

  container.innerHTML = validSchools.map(s => {
    const count = s.book_count || 0;
    const percent = Math.round((count / total) * 100);

    return `
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-medium text-stone-800 dark:text-stone-200">${s.name}</span>
          <span class="font-mono text-stone-500 text-[11px]">${count} tác phẩm (${percent}%)</span>
        </div>
        <div class="w-full h-2 bg-stone-200 dark:bg-emerald-950 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-700 dark:bg-amber-500 rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render Dòng Thời Gian Câu Hỏi Độc Giả Gửi AI Socrates
 */
function renderRecentAiQuestions(questions) {
  const container = document.getElementById('recent-ai-stream');
  if (!container) return;

  if (!questions || questions.length === 0) {
    container.innerHTML = '<p class="text-xs text-stone-400 italic">Chưa có lượt tương tác AI nào gần đây.</p>';
    return;
  }

  container.innerHTML = questions.map(q => {
    return `
      <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/80 dark:border-emerald-800/40 space-y-1.5 hover:border-amber-500/30 transition-all">
        <div class="flex items-center justify-between text-[11px] text-stone-500">
          <span class="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
            <i data-lucide="book" class="w-3 h-3"></i>
            <span>${q.book_title || 'Tác phẩm chung'}</span>
          </span>
          <span class="font-mono text-[10px] text-stone-400">${q.created_at || 'Vừa xong'}</span>
        </div>
        <p class="text-xs font-medium text-stone-800 dark:text-stone-200 leading-relaxed font-ui">
          "${q.question}"
        </p>
      </div>
    `;
  }).join('');
}

/**
 * Render Danh Ngôn Của Ngày
 */
function renderDailyQuote(q) {
  if (!q) return;
  const quoteText = document.getElementById('admin-daily-quote-text');
  const quoteAuthor = document.getElementById('admin-daily-quote-author');
  const quoteSchool = document.getElementById('admin-daily-quote-school');
  const quoteShares = document.getElementById('admin-daily-quote-shares');
  const bannerQuote = document.getElementById('dashboard-daily-quote-banner');

  if (quoteText) quoteText.textContent = `"${q.quote}"`;
  if (quoteAuthor) quoteAuthor.textContent = q.author;
  if (quoteSchool) quoteSchool.textContent = q.school || 'Triết học';
  if (quoteShares) quoteShares.textContent = `${q.shares_count || 0} lượt xuất ảnh`;
  if (bannerQuote) bannerQuote.textContent = `"${q.quote}" — ${q.author}`;
}

/**
 * Render Trạng Thái Kết Nối SQLite Badge
 */
function renderDbStatusBadge(health) {
  if (!health) return;
  const badge = document.getElementById('top-db-health-badge');
  const sizeText = document.getElementById('quick-db-size-text');

  if (badge) {
    badge.innerHTML = `
      <i data-lucide="database" class="w-3.5 h-3.5 text-emerald-400"></i>
      <span>sophia.db (${health.sizeKb} KB) • Online</span>
    `;
  }
  if (sizeText) {
    sizeText.textContent = `${health.sizeKb} KB • ${health.tables?.chapters || 0} Chương Toàn Văn`;
  }
}

/**
 * =========================================================================
 * 2. ĐIỀU HƯỚNG CÁC PHÂN HỆ QUẢN TRỊ (TABS CONTROLLER)
 * =========================================================================
 */
function switchAdminTab(tabName) {
  if (tabName === 'settings') {
    openDbHealthModal();
    return;
  }

  const supportedTabs = ['overview', 'books', 'chapters', 'quotes', 'ai', 'philosophers', 'audio', 'users', 'roles', 'audit'];
  
  if (!supportedTabs.includes(tabName)) {
    showToast(`💡 Phân hệ "${tabName}" đang hoàn thiện trong các bản cập nhật tiếp theo!`);
    return;
  }

  supportedTabs.forEach(t => {
    const tabEl = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-btn-${t}`);
    if (tabEl) {
      if (t === tabName) {
        tabEl.classList.remove('hidden');
        tabEl.classList.add('animate-fade-in');
      } else {
        tabEl.classList.add('hidden');
      }
    }
    if (navBtn) {
      if (t === tabName) {
        navBtn.className = "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 font-bold border border-amber-500/30 transition-all shadow-sm";
      } else {
        navBtn.className = "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-stone-300 hover:bg-emerald-900/40 hover:text-white transition-all";
      }
    }
  });

  const breadcrumb = document.getElementById('breadcrumb-current-tab');
  if (breadcrumb) {
    const titles = {
      overview: 'Bảng Điều Khiển Tổng Quan',
      books: 'Quản Lý Tủ Sách Toàn Văn',
      chapters: 'Soạn Thảo & Quản Lý Chương Mục Toàn Văn',
      quotes: 'Kho Danh Ngôn & Thiệp FB',
      ai: 'Hiền Triết AI Hub — Điều Hành & Đàm Đạo Socrates',
      philosophers: 'Bậc Thầy Tư Tưởng & Dòng Thời Gian Lịch Sử',
      audio: 'Studio Âm Thanh & Nhạc Nền Thiền Định',
      users: 'Quản Lý Người Dùng',
      roles: 'Vai Trò & Quyền Hạn',
      audit: 'Nhật Ký Hệ Thống'
    };
    breadcrumb.textContent = titles[tabName] || 'Quản Trị';
  }

  // Dọn dẹp âm thanh và giọng đọc khi rời khỏi tab audio
  if (tabName !== 'audio') {
    if (typeof stopAdminBgmPlay === 'function') stopAdminBgmPlay();
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }

  if (tabName === 'overview') loadOverviewDashboard();
  if (tabName === 'books') loadBooksList();
  if (tabName === 'chapters') loadChaptersStudio();
  if (tabName === 'quotes') loadQuotesList();
  if (tabName === 'ai') loadAiHub();
  if (tabName === 'philosophers') loadPhilosophersTab();
  if (tabName === 'audio') loadAudioStudioTab();
  if (tabName === 'users') loadUsers();
  if (tabName === 'roles') loadRoles();
  if (tabName === 'audit') loadAuditLogs();

  if (window.lucide) window.lucide.createIcons();
}

/**
 * =========================================================================
 * 3. PHÂN HỆ TỦ SÁCH (BOOK STUDIO)
 * =========================================================================
 */
async function preloadBooks() {
  try {
    const res = await fetch('/api/books');
    if (res.ok) {
      allBooksCache = await res.json();
      populateBookSelectors();
    }
  } catch (e) {
    console.error('Lỗi nạp danh sách sách ngầm:', e);
  }
}

async function loadBooksList() {
  const container = document.getElementById('admin-books-grid');
  if (!container) return;
  container.innerHTML = '<div class="col-span-full py-8 text-center text-xs text-stone-400"><i data-lucide="loader" class="w-5 h-5 mx-auto mb-2 animate-spin text-amber-500"></i>Đang tải dữ liệu từ SQLite...</div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await fetch('/api/books');
    allBooksCache = await res.json();
    populateBookSelectors();
    renderFilteredBooks();
  } catch (err) {
    container.innerHTML = '<p class="col-span-full text-xs text-rose-500">Lỗi khi tải danh sách sách từ SQLite.</p>';
  }
}

function filterAdminBooks(category) {
  currentBookFilter = category;
  
  // Update filter pills active UI
  document.querySelectorAll('.admin-book-filter').forEach(btn => {
    btn.className = "admin-book-filter px-3.5 py-1.5 rounded-xl font-medium bg-white dark:bg-emerald-950/60 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800 transition-all";
  });
  const activeBtn = document.getElementById(`book-filter-${category}`);
  if (activeBtn) {
    activeBtn.className = "admin-book-filter px-3.5 py-1.5 rounded-xl font-bold bg-emerald-950 text-amber-300 border border-amber-500/40 shadow-sm transition-all";
  }

  renderFilteredBooks();
}

function renderFilteredBooks() {
  const container = document.getElementById('admin-books-grid');
  if (!container) return;

  const filtered = currentBookFilter === 'all'
    ? allBooksCache
    : allBooksCache.filter(b => b.category_id === currentBookFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 rounded-3xl bg-white dark:bg-[#111E17] border border-stone-200 dark:border-emerald-900 text-center space-y-3">
        <p class="text-sm font-semibold text-stone-600 dark:text-stone-300">Chưa có tác phẩm nào thuộc nhóm này.</p>
        <button onclick="openNewBookModal()" class="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 shadow">
          <i data-lucide="plus" class="w-4 h-4"></i> Thêm Tác Phẩm Mới
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(b => {
    const schoolLabel = b.school || (b.category_id === 'stoicism' ? 'Khắc Kỷ' : b.category_id === 'eastern' ? 'Đạo Gia' : b.category_id === 'existentialism' ? 'Hiện Sinh' : 'Cổ Điển');
    const isPublished = b.status === 'published';

    return `
      <div class="p-5 rounded-3xl bg-white dark:bg-[#111E17] border border-stone-200/90 dark:border-emerald-900/60 shadow-sm space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
        <div class="space-y-3">
          <!-- Top Row: Cover + Status Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="relative group">
              <img src="${b.cover_image || 'assets/covers/suy-tuong.svg'}" alt="${b.title}" class="w-20 h-28 object-cover rounded-xl shadow-md border border-stone-200 dark:border-emerald-800 group-hover:scale-105 transition-transform">
              <span class="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] text-amber-300 font-mono px-1.5 py-0.5 rounded">
                ${b.year || 'Kinh điển'}
              </span>
            </div>
            <div class="text-right space-y-1">
              <span class="text-[10px] font-semibold px-2.5 py-1 rounded-full border ${isPublished ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/30' : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-600/30'}">
                ${isPublished ? '● Đã Xuất Bản' : '○ Bản Thảo'}
              </span>
              <div class="text-[11px] font-mono text-stone-400 pt-1">
                ID: <span class="text-stone-600 dark:text-stone-300 font-bold">${b.id}</span>
              </div>
            </div>
          </div>

          <!-- Titles & Details -->
          <div>
            <h3 class="font-bold text-base text-stone-900 dark:text-stone-100 line-clamp-1">${b.title}</h3>
            <p class="text-xs text-stone-500 italic font-reading">${b.author} ${b.original_title ? `• (${b.original_title})` : ''}</p>
            <div class="mt-2 flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20">
                ${schoolLabel}
              </span>
              <span class="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-emerald-950 text-stone-600 dark:text-stone-400 text-[11px] font-mono">
                ⏱️ ${b.read_time || 'Đọc sâu'}
              </span>
            </div>
            <p class="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mt-2.5 font-ui leading-relaxed">
              ${b.summary || b.tagline || 'Kiệt tác minh triết nhân loại.'}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-stone-100 dark:border-emerald-900/60 flex items-center justify-between gap-2 text-xs">
          <!-- Primary Studio Action: Quản lý chương -->
          <button onclick="openChaptersForBook('${b.id}')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>Quản Lý Chương</span>
          </button>

          <!-- Utilities Actions -->
          <div class="flex items-center gap-1">
            <button onclick="openEditBookModal('${b.id}')" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900 transition-colors" title="Chỉnh sửa thông tin">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <a href="/?book=${b.id}" target="_blank" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900 transition-colors" title="Xem trên giao diện Độc Giả">
              <i data-lucide="external-link" class="w-4 h-4"></i>
            </a>
            <button onclick="handleDeleteBook('${b.id}')" class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Xóa tác phẩm">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Populate Book Selectors across Admin Modals & Tabs
 */
function populateBookSelectors() {
  const chapterSelect = document.getElementById('chapter-book-selector');
  const ingestSelect = document.getElementById('smart-ingest-book-select');

  if (chapterSelect) {
    const prevVal = chapterSelect.value;
    chapterSelect.innerHTML = allBooksCache.map(b => `
      <option value="${b.id}">${b.title} — ${b.author}</option>
    `).join('');
    if (prevVal && allBooksCache.some(b => b.id === prevVal)) {
      chapterSelect.value = prevVal;
    } else if (allBooksCache.length > 0) {
      chapterSelect.value = allBooksCache[0].id;
    }
  }

  if (ingestSelect) {
    ingestSelect.innerHTML = allBooksCache.map(b => `
      <option value="${b.id}">${b.title} (${b.author})</option>
    `).join('');
  }
}

/**
 * Mở modal chỉnh sửa tác phẩm
 */
async function openEditBookModal(bookId) {
  let book = allBooksCache.find(b => b.id === bookId);
  if (!book) {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      if (res.ok) book = await res.json();
    } catch(e) {}
  }
  if (!book) {
    showToast('⚠️ Không tìm thấy thông tin tác phẩm');
    return;
  }

  document.getElementById('edit-book-id').value = book.id;
  document.getElementById('edit-book-title').value = book.title || '';
  document.getElementById('edit-book-original-title').value = book.original_title || '';
  document.getElementById('edit-book-author').value = book.author || '';
  document.getElementById('edit-book-category').value = book.category_id || 'stoicism';
  const schoolEl = document.getElementById('edit-book-school');
  if (schoolEl) schoolEl.value = book.school || '';
  document.getElementById('edit-book-year').value = book.year || '';
  document.getElementById('edit-book-tagline').value = book.tagline || '';
  document.getElementById('edit-book-summary').value = book.summary || '';
  document.getElementById('edit-book-status').value = book.status || 'published';
  document.getElementById('edit-book-cover').value = book.cover_image || '';

  openModal('modal-edit-book');
}

/**
 * Lưu chỉnh sửa tác phẩm vào SQLite
 */
async function handleUpdateBookSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById('edit-book-id').value;
  const title = document.getElementById('edit-book-title').value.trim();
  const originalTitle = document.getElementById('edit-book-original-title').value.trim();
  const author = document.getElementById('edit-book-author').value.trim();
  const category = document.getElementById('edit-book-category').value;
  const schoolInput = document.getElementById('edit-book-school');
  const year = document.getElementById('edit-book-year').value.trim();
  const tagline = document.getElementById('edit-book-tagline').value.trim();
  const summary = document.getElementById('edit-book-summary').value.trim();
  const status = document.getElementById('edit-book-status').value;
  const coverImage = document.getElementById('edit-book-cover').value.trim();

  const schoolMapping = {
    stoicism: 'Chủ nghĩa Khắc Kỷ',
    eastern: 'Triết học Phương Đông',
    existentialism: 'Chủ nghĩa Hiện sinh',
    classical: 'Hy Lạp & La Mã Cổ Đại',
    enlightenment: 'Thời kỳ Khai Sáng'
  };

  const school = (schoolInput && schoolInput.value.trim()) || schoolMapping[category] || 'Triết học';

  try {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        original_title: originalTitle,
        author,
        category_id: category,
        school,
        year,
        tagline,
        summary,
        status,
        cover_image: coverImage
      })
    });

    if (res.ok) {
      closeModal('modal-edit-book');
      showToast(`✨ Đã cập nhật thành công tác phẩm "${title}"!`);
      loadBooksList();
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Lỗi khi cập nhật tác phẩm');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

/**
 * Xóa tác phẩm
 */
async function handleDeleteBook(bookId) {
  const book = allBooksCache.find(b => b.id === bookId);
  const title = book ? `"${book.title}"` : 'tác phẩm này';
  if (!confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa ${title} cùng toàn bộ các chương liên quan khỏi SQLite?`)) return;

  try {
    const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`🗑️ Đã xóa tác phẩm thành công khỏi SQLite!`);
      loadBooksList();
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Không thể xóa tác phẩm');
    }
  } catch (err) {
    showToast('⚠️ Lỗi khi gửi yêu cầu xóa');
  }
}

/**
 * =========================================================================
 * 4. PHÂN HỆ SOẠN THẢO CHƯƠNG MỤC TOÀN VĂN (CHAPTER STUDIO)
 * =========================================================================
 */
async function loadChaptersStudio() {
  if (allBooksCache.length === 0) {
    await preloadBooks();
  }

  const selector = document.getElementById('chapter-book-selector');
  if (!currentSelectedBookId) {
    currentSelectedBookId = selector && selector.value ? selector.value : (allBooksCache[0]?.id || 'suy-tuong');
  }

  if (selector) selector.value = currentSelectedBookId;
  await loadChaptersForBook(currentSelectedBookId);
}

function openChaptersForBook(bookId) {
  currentSelectedBookId = bookId;
  switchAdminTab('chapters');
  const selector = document.getElementById('chapter-book-selector');
  if (selector) selector.value = bookId;
  loadChaptersForBook(bookId);
}

function onSelectBookForChapters(bookId) {
  currentSelectedBookId = bookId;
  loadChaptersForBook(bookId);
}

async function loadChaptersForBook(bookId) {
  if (!bookId) return;
  const listContainer = document.getElementById('admin-chapters-list');
  const metaBar = document.getElementById('selected-book-meta-bar');
  const countBadge = document.getElementById('chapters-list-count');

  if (listContainer) {
    listContainer.innerHTML = '<div class="py-8 text-center text-xs text-stone-400"><i data-lucide="loader" class="w-5 h-5 mx-auto mb-2 animate-spin text-amber-500"></i>Đang tải danh sách chương...</div>';
    if (window.lucide) window.lucide.createIcons();
  }

  // Find book details
  const book = allBooksCache.find(b => b.id === bookId) || { id: bookId, title: 'Tác Phẩm', author: 'Tác Giả' };

  try {
    const res = await fetch(`/api/books/${bookId}/chapters`);
    if (!res.ok) throw new Error('Không thể tải chương');
    const chapters = await res.json();
    currentBookChaptersCache = chapters;

    // Render Meta Bar
    if (metaBar) {
      metaBar.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${book.cover_image || 'assets/covers/suy-tuong.svg'}" class="w-9 h-12 rounded-lg object-cover shadow border border-stone-200 dark:border-emerald-800">
          <div>
            <div class="font-bold text-stone-900 dark:text-stone-100 text-sm">${book.title}</div>
            <div class="text-[11px] text-stone-500 italic">${book.author} • <span class="text-amber-700 dark:text-amber-400 font-medium">${book.school || ''}</span></div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">${chapters.length}</span>
            <span class="text-xs text-stone-500"> chương hoàn tất</span>
          </div>
          <a href="/?book=${book.id}" target="_blank" class="px-3 py-1.5 rounded-xl bg-stone-200/80 dark:bg-emerald-950 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:text-amber-600 flex items-center gap-1.5 transition-colors">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            <span>Đọc Thử Nghiệm</span>
          </a>
        </div>
      `;
    }

    if (countBadge) {
      countBadge.textContent = `${chapters.length} chương đã lưu trữ`;
    }

    // Render Chapters List
    if (!chapters || chapters.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 rounded-2xl bg-white dark:bg-[#111E17] border border-dashed border-stone-300 dark:border-emerald-800 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <i data-lucide="file-text" class="w-6 h-6"></i>
          </div>
          <p class="text-xs text-stone-500">Tác phẩm này chưa có chương toàn văn nào trong SQLite.</p>
          <div class="flex items-center justify-center gap-2">
            <button onclick="openSmartIngestForCurrentBook()" class="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow hover:bg-purple-700 flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Nạp Toàn Văn (Smart Ingest)
            </button>
            <button onclick="openNewChapterModal()" class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow hover:bg-amber-600 flex items-center gap-1.5">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Thêm Thủ Công
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    listContainer.innerHTML = chapters.map((chap, idx) => {
      const paragraphCount = chap.paragraphs ? chap.paragraphs.length : 0;
      const previewSnippet = (chap.paragraphs && chap.paragraphs[0]) ? chap.paragraphs[0].slice(0, 160) + '...' : 'Chưa có nội dung đoạn văn.';
      const takeawaysCount = chap.takeaways ? chap.takeaways.length : 0;

      return `
        <div class="p-4 rounded-2xl bg-white dark:bg-[#111E17] border border-stone-200/90 dark:border-emerald-900/60 shadow-sm hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div class="flex items-start gap-3.5 min-w-0 flex-1">
            <!-- Chapter Index Number Tag -->
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              ${idx + 1}
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-xs uppercase text-amber-700 dark:text-amber-400 font-mono">${chap.chapter_number || `Chương ${idx + 1}`}</span>
                <span class="text-stone-300 dark:text-stone-700">•</span>
                <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">${chap.title}</h4>
              </div>

              ${chap.subtitle ? `<p class="text-[11px] text-stone-500 italic truncate">${chap.subtitle}</p>` : ''}

              <!-- Paragraph preview snippet -->
              <p class="text-xs text-stone-600 dark:text-stone-400 font-reading italic line-clamp-1">
                "${previewSnippet}"
              </p>

              <!-- Meta badges -->
              <div class="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                <span class="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950 text-stone-600 dark:text-stone-400 font-mono">
                  📄 ${paragraphCount} đoạn văn
                </span>
                <span class="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950 text-stone-600 dark:text-stone-400 font-mono">
                  ⏱️ ${chap.reading_time_minutes || 5} phút đọc
                </span>
                ${takeawaysCount > 0 ? `
                  <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                    🎯 ${takeawaysCount} bài học thực tiễn
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button onclick="openEditChapterModal('${chap.id}')" class="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-700 dark:text-stone-300 text-xs font-bold border border-stone-200 dark:border-emerald-800 transition-all flex items-center gap-1.5">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Soạn Thảo</span>
            </button>
            <button onclick="handleDeleteChapter('${chap.id}')" class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Xóa chương này">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    listContainer.innerHTML = '<p class="text-xs text-rose-500">Lỗi khi tải danh sách chương từ SQLite.</p>';
  }
}

/**
 * Mở modal thêm chương mới
 */
function openNewChapterModal() {
  if (!currentSelectedBookId) {
    currentSelectedBookId = allBooksCache[0]?.id || 'suy-tuong';
  }
  const book = allBooksCache.find(b => b.id === currentSelectedBookId) || { title: 'Tác phẩm hiện tại', author: '' };

  document.getElementById('editor-chapter-id').value = '';
  document.getElementById('editor-book-id').value = currentSelectedBookId;
  document.getElementById('chapter-editor-modal-title').textContent = 'Thêm Chương Mới Vào Tác Phẩm';
  document.getElementById('chapter-editor-book-subtitle').textContent = `Tác phẩm: ${book.title} — ${book.author}`;

  // Next chapter number suggestion
  const nextNumber = currentBookChaptersCache.length + 1;
  document.getElementById('editor-chapter-number').value = `Chương ${nextNumber}`;
  document.getElementById('editor-chapter-title').value = '';
  document.getElementById('editor-chapter-subtitle').value = '';
  document.getElementById('editor-chapter-paragraphs').value = '';

  // Reset takeaways
  document.getElementById('editor-takeaway-1-title').value = '';
  document.getElementById('editor-takeaway-1-desc').value = '';
  document.getElementById('editor-takeaway-2-title').value = '';
  document.getElementById('editor-takeaway-2-desc').value = '';
  document.getElementById('editor-takeaway-3-title').value = '';
  document.getElementById('editor-takeaway-3-desc').value = '';

  openModal('modal-chapter-editor');
}

/**
 * Mở modal chỉnh sửa chương
 */
async function openEditChapterModal(chapId) {
  try {
    const res = await fetch(`/api/chapters/${chapId}`);
    if (!res.ok) throw new Error('Không thể nạp chi tiết chương');
    const chap = await res.json();

    const book = allBooksCache.find(b => b.id === chap.book_id) || { title: 'Tác phẩm' };

    document.getElementById('editor-chapter-id').value = chap.id;
    document.getElementById('editor-book-id').value = chap.book_id;
    document.getElementById('chapter-editor-modal-title').textContent = `Soạn Thảo Toàn Văn: ${chap.chapter_number}`;
    document.getElementById('chapter-editor-book-subtitle').textContent = `Tác phẩm: ${book.title} — ${book.author || ''}`;

    document.getElementById('editor-chapter-number').value = chap.chapter_number || '';
    document.getElementById('editor-chapter-title').value = chap.title || '';
    document.getElementById('editor-chapter-subtitle').value = chap.subtitle || '';
    document.getElementById('editor-chapter-paragraphs').value = (chap.paragraphs || []).join('\n\n');

    // Populate takeaways
    const t = chap.takeaways || [];
    document.getElementById('editor-takeaway-1-title').value = t[0]?.title || '';
    document.getElementById('editor-takeaway-1-desc').value = t[0]?.description || t[0]?.desc || '';
    document.getElementById('editor-takeaway-2-title').value = t[1]?.title || '';
    document.getElementById('editor-takeaway-2-desc').value = t[1]?.description || t[1]?.desc || '';
    document.getElementById('editor-takeaway-3-title').value = t[2]?.title || '';
    document.getElementById('editor-takeaway-3-desc').value = t[2]?.description || t[2]?.desc || '';

    openModal('modal-chapter-editor');
  } catch (err) {
    showToast('⚠️ Không thể tải dữ liệu chương này');
  }
}

/**
 * Lưu chương (Tạo mới hoặc Cập nhật) vào SQLite
 */
async function handleChapterEditorSubmit(e) {
  e.preventDefault();
  const chapId = document.getElementById('editor-chapter-id').value;
  const bookId = document.getElementById('editor-book-id').value || currentSelectedBookId;
  const chapterNumber = document.getElementById('editor-chapter-number').value.trim();
  const title = document.getElementById('editor-chapter-title').value.trim();
  const subtitle = document.getElementById('editor-chapter-subtitle').value.trim();
  const rawParagraphs = document.getElementById('editor-chapter-paragraphs').value;

  // Split into paragraphs by blank lines
  const paragraphs = rawParagraphs
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    showToast('⚠️ Vui lòng nhập ít nhất một đoạn văn toàn văn');
    return;
  }

  // Collect takeaways
  const takeaways = [];
  const t1Title = document.getElementById('editor-takeaway-1-title').value.trim();
  const t1Desc = document.getElementById('editor-takeaway-1-desc').value.trim();
  if (t1Title || t1Desc) takeaways.push({ title: t1Title || 'Bài học 1', description: t1Desc, desc: t1Desc });

  const t2Title = document.getElementById('editor-takeaway-2-title').value.trim();
  const t2Desc = document.getElementById('editor-takeaway-2-desc').value.trim();
  if (t2Title || t2Desc) takeaways.push({ title: t2Title || 'Bài học 2', description: t2Desc, desc: t2Desc });

  const t3Title = document.getElementById('editor-takeaway-3-title').value.trim();
  const t3Desc = document.getElementById('editor-takeaway-3-desc').value.trim();
  if (t3Title || t3Desc) takeaways.push({ title: t3Title || 'Bài học 3', description: t3Desc, desc: t3Desc });

  const readingTime = Math.max(3, Math.ceil(paragraphs.join(' ').length / 800));

  const payload = {
    book_id: bookId,
    chapter_number: chapterNumber,
    title,
    subtitle,
    paragraphs,
    takeaways,
    reading_time_minutes: readingTime
  };

  try {
    let res;
    if (chapId) {
      // Update
      res = await fetch(`/api/chapters/${chapId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create new
      res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      closeModal('modal-chapter-editor');
      showToast(`✨ Đã lưu thành công "${chapterNumber}: ${title}" vào SQLite!`);
      loadChaptersForBook(bookId);
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Lỗi khi lưu chương');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

/**
 * Xóa chương
 */
async function handleDeleteChapter(chapId) {
  if (!confirm('Bạn có chắc chắn muốn xóa chương này khỏi cơ sở dữ liệu SQLite?')) return;

  try {
    const res = await fetch(`/api/chapters/${chapId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('🗑️ Đã xóa chương thành công!');
      loadChaptersForBook(currentSelectedBookId);
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Không thể xóa chương');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

/**
 * =========================================================================
 * 5. SMART INGEST: NẠP VĂN BẢN TỰ ĐỘNG BÓC TÁCH CHƯƠNG VÀO SQLITE
 * =========================================================================
 */
function openSmartIngestForCurrentBook() {
  if (currentSelectedBookId) {
    const ingestSelect = document.getElementById('smart-ingest-book-select');
    if (ingestSelect) ingestSelect.value = currentSelectedBookId;
  }
  openModal('modal-smart-ingest');
}

function handleSmartIngestFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const textarea = document.getElementById('smart-ingest-raw-text');
    if (textarea) {
      textarea.value = event.target.result;
      showToast(`📄 Đã tải xong nội dung tệp "${file.name}"!`);
    }
  };
  reader.readAsText(file, 'utf-8');
}

async function handleSmartIngestSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById('smart-ingest-book-select').value;
  const rawText = document.getElementById('smart-ingest-raw-text').value.trim();
  const submitBtn = document.getElementById('btn-smart-ingest-submit');

  if (!rawText) {
    showToast('⚠️ Vui lòng dán văn bản hoặc tải tệp lên');
    return;
  }

  const origBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Đang AI bóc tách & nạp vào SQLite...</span>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await fetch(`/api/books/${bookId}/smart-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      closeModal('modal-smart-ingest');
      const rawTextEl = document.getElementById('smart-ingest-raw-text');
      if (rawTextEl) rawTextEl.value = '';
      const fileInputEl = document.getElementById('smart-ingest-file-input');
      if (fileInputEl) fileInputEl.value = '';

      const insertedCount = data.totalParsed || data.count || (data.insertedIds ? data.insertedIds.length : 0);
      showToast(`🎉 Thành công! Đã tự động bóc tách và nạp ${insertedCount} chương vào SQLite!`);
      
      // Refresh current views
      loadOverviewDashboard();
      if (!document.getElementById('tab-chapters').classList.contains('hidden')) {
        currentSelectedBookId = bookId;
        loadChaptersForBook(bookId);
      }
    } else {
      showToast(`⚠️ Lỗi bóc tách: ${data.error || 'Vui lòng kiểm tra lại cấu trúc văn bản'}`);
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối máy chủ');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origBtnContent;
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * =========================================================================
 * 6. PHÂN HỆ KHO DANH NGÔN & XƯỞNG THIỆP FACEBOOK (QUOTES & FB CARD STUDIO)
 * =========================================================================
 */
async function loadQuotesList() {
  const container = document.getElementById('admin-quotes-list');
  if (!container) return;
  container.innerHTML = '<div class="py-8 text-center text-xs text-stone-400"><i data-lucide="loader" class="w-5 h-5 mx-auto mb-2 animate-spin text-amber-500"></i>Đang tải kho danh ngôn từ SQLite...</div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await fetch('/api/quotes');
    allQuotesCache = await res.json();

    // Cập nhật bộ đếm
    const counterEl = document.getElementById('admin-quotes-counter');
    if (counterEl) counterEl.textContent = `${allQuotesCache.length} danh ngôn`;

    // Cập nhật banner tiêu điểm danh ngôn hôm nay
    const daily = allQuotesCache.find(q => q.is_daily === 1) || allQuotesCache[0];
    if (daily) {
      const hText = document.getElementById('hero-daily-quote-text');
      const hAuthor = document.getElementById('hero-daily-quote-author');
      const hSchool = document.getElementById('hero-daily-quote-school');
      const hContext = document.getElementById('hero-daily-quote-context');
      const hShares = document.getElementById('hero-daily-quote-shares');

      if (hText) hText.textContent = `"${daily.quote}"`;
      if (hAuthor) hAuthor.textContent = daily.author;
      if (hSchool) hSchool.textContent = daily.school || 'Triết học';
      if (hContext) hContext.textContent = daily.context || 'Sophia Codex';
      if (hShares) hShares.textContent = `${daily.shares_count || 0} lượt xuất ảnh`;
    }

    renderFilteredQuotes();
  } catch (err) {
    container.innerHTML = '<p class="text-xs text-rose-500">Lỗi khi tải kho danh ngôn từ SQLite.</p>';
  }
}

function filterAdminQuotes(category) {
  currentQuoteFilter = category;

  document.querySelectorAll('.admin-quote-filter').forEach(btn => {
    btn.className = "admin-quote-filter px-3.5 py-1.5 rounded-xl font-medium bg-white dark:bg-emerald-950/60 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800 transition-all";
  });
  const activeBtn = document.getElementById(`quote-filter-${category}`);
  if (activeBtn) {
    activeBtn.className = "admin-quote-filter px-3.5 py-1.5 rounded-xl font-bold bg-emerald-950 text-amber-300 border border-amber-500/40 shadow-sm transition-all";
  }

  renderFilteredQuotes();
}

function renderFilteredQuotes() {
  const container = document.getElementById('admin-quotes-list');
  if (!container) return;

  const schoolKeywordMap = {
    stoicism: 'khắc kỷ',
    eastern: 'đạo',
    existentialism: 'hiện sinh',
    classical: 'hy lạp',
    enlightenment: 'khai sáng'
  };

  const filtered = currentQuoteFilter === 'all'
    ? allQuotesCache
    : allQuotesCache.filter(q => {
        const target = schoolKeywordMap[currentQuoteFilter] || currentQuoteFilter.toLowerCase();
        const schoolStr = (q.school || '').toLowerCase();
        const contextStr = (q.context || '').toLowerCase();
        return schoolStr.includes(target) || contextStr.includes(target);
      });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 rounded-3xl bg-white dark:bg-[#111E17] border border-stone-200 dark:border-emerald-900 text-center space-y-3">
        <p class="text-xs text-stone-500">Chưa có danh ngôn nào thuộc nhóm này trong SQLite.</p>
        <button onclick="openNewQuoteModal()" class="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 shadow">
          <i data-lucide="plus" class="w-4 h-4"></i> Thêm Danh Ngôn Mới
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(q => {
    const isDaily = q.is_daily === 1;

    return `
      <div class="p-5 rounded-2xl bg-white dark:bg-[#111E17] border border-stone-200/90 dark:border-emerald-900/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-500/40 transition-all">
        <div class="space-y-2 flex-1 min-w-0">
          <blockquote class="font-reading italic text-sm md:text-base text-stone-900 dark:text-stone-100 leading-relaxed">
            "${q.quote}"
          </blockquote>

          <div class="flex items-center gap-2 flex-wrap text-xs">
            <span class="font-bold text-stone-900 dark:text-stone-100">${q.author}</span>
            <span class="text-stone-300 dark:text-stone-700">•</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-[11px] border border-amber-500/20">
              ${q.school || 'Triết học'}
            </span>
            ${q.context ? `
              <span class="text-stone-500 italic text-[11px] truncate max-w-xs">
                ${q.context}
              </span>
            ` : ''}
            <span class="text-stone-400 font-mono text-[11px] bg-stone-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              📸 ${q.shares_count || 0} lượt xuất thiệp FB
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
          ${isDaily ? `
            <span class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/40 flex items-center gap-1">
              ⭐ Danh Ngôn Hôm Nay
            </span>
          ` : `
            <button onclick="handleSetDailyQuote(${q.id})" class="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950 hover:bg-amber-500 hover:text-stone-950 text-stone-700 dark:text-stone-300 text-xs font-semibold border border-stone-200 dark:border-emerald-800 transition-all flex items-center gap-1">
              <i data-lucide="star" class="w-3.5 h-3.5"></i>
              <span>Đặt Cho Hôm Nay</span>
            </button>
          `}

          <button onclick="openQuoteCardStudio(${q.id})" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5" title="Mở Xưởng Thiệp FB với danh ngôn này">
            <i data-lucide="image" class="w-3.5 h-3.5"></i>
            <span>Thiệp FB</span>
          </button>

          <button onclick="openEditQuoteModal(${q.id})" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900 transition-colors" title="Chỉnh sửa danh ngôn">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>

          <button onclick="handleDeleteQuote(${q.id})" class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Xóa danh ngôn">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openHeroDailyQuoteCard() {
  const daily = allQuotesCache.find(q => q.is_daily === 1) || allQuotesCache[0];
  if (daily) {
    openQuoteCardStudio(daily.id);
  } else {
    openQuoteCardStudio();
  }
}

async function handleSetDailyQuote(quoteId) {
  try {
    const res = await fetch(`/api/quotes/${quoteId}/daily`, { method: 'PUT' });
    if (!res.ok) throw new Error('Không thể cập nhật danh ngôn');
    showToast('✨ Đã đặt làm danh ngôn hiển thị trên trang chủ thành công!');
    loadOverviewDashboard();
    loadQuotesList();
  } catch (err) {
    showToast('⚠️ Lỗi khi cập nhật danh ngôn');
  }
}

function openChangeDailyQuoteModal() {
  switchAdminTab('quotes');
  showToast('💡 Hãy chọn danh ngôn bạn muốn và bấm "Đặt Cho Hôm Nay"!');
}

async function openEditQuoteModal(quoteId) {
  let quote = allQuotesCache.find(q => q.id === quoteId);
  if (!quote) {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`);
      if (res.ok) quote = await res.json();
    } catch(e) {}
  }
  if (!quote) {
    showToast('⚠️ Không tìm thấy danh ngôn');
    return;
  }

  document.getElementById('edit-quote-id').value = quote.id;
  document.getElementById('edit-quote-text').value = quote.quote || '';
  document.getElementById('edit-quote-author').value = quote.author || '';
  document.getElementById('edit-quote-school').value = quote.school || '';
  document.getElementById('edit-quote-context').value = quote.context || '';

  openModal('modal-edit-quote');
}

async function handleUpdateQuoteSubmit(e) {
  e.preventDefault();
  const quoteId = document.getElementById('edit-quote-id').value;
  const quote = document.getElementById('edit-quote-text').value.trim();
  const author = document.getElementById('edit-quote-author').value.trim();
  const school = document.getElementById('edit-quote-school').value.trim();
  const context = document.getElementById('edit-quote-context').value.trim();

  try {
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, author, school, context })
    });

    if (res.ok) {
      closeModal('modal-edit-quote');
      showToast('✨ Đã cập nhật danh ngôn thành công!');
      loadQuotesList();
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Lỗi khi cập nhật danh ngôn');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

async function handleDeleteQuote(quoteId) {
  if (!confirm('Bạn có chắc chắn muốn xóa danh ngôn này khỏi cơ sở dữ liệu SQLite?')) return;

  try {
    const res = await fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('🗑️ Đã xóa danh ngôn thành công!');
      loadQuotesList();
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Không thể xóa danh ngôn');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

/**
 * =========================================================================
 * XƯỞNG THIẾT KẾ THIỆP DANH NGÔN FACEBOOK (ADMIN CANVAS STUDIO HD 1080P)
 * =========================================================================
 */
function openQuoteCardStudio(quoteId = null) {
  if (quoteId) {
    const q = allQuotesCache.find(item => item.id === quoteId);
    if (q) {
      adminCardQuoteId = q.id;
      adminCardQuoteText = q.quote;
      adminCardAuthor = q.author;
      adminCardBook = q.context || q.school || 'Sophia Codex';
    }
  } else {
    adminCardQuoteId = null;
    const currentInputText = document.getElementById('admin-card-input-text')?.value?.trim();
    if (!currentInputText) {
      adminCardQuoteText = "Không phải sự vật làm ta phiền lòng, mà chính cách ta nhìn nhận chúng.";
      adminCardAuthor = "Marcus Aurelius";
      adminCardBook = "Suy Tưởng (Meditations)";
    } else {
      adminCardQuoteText = currentInputText;
      adminCardAuthor = document.getElementById('admin-card-input-author')?.value || "Marcus Aurelius";
      adminCardBook = document.getElementById('admin-card-input-book')?.value || "Sophia Codex";
    }
  }

  const textEl = document.getElementById('admin-card-input-text');
  const authorEl = document.getElementById('admin-card-input-author');
  const bookEl = document.getElementById('admin-card-input-book');

  if (textEl) textEl.value = adminCardQuoteText;
  if (authorEl) authorEl.value = adminCardAuthor;
  if (bookEl) bookEl.value = adminCardBook;

  openModal('modal-admin-quote-card');
  if (document.fonts) {
    document.fonts.ready.then(() => renderAdminQuoteCanvas());
  } else {
    renderAdminQuoteCanvas();
  }
}

function setAdminCardFormat(fmt) {
  adminCardFormat = fmt;

  const btnFeed = document.getElementById('admin-card-btn-feed');
  const btnStory = document.getElementById('admin-card-btn-story');

  if (btnFeed && btnStory) {
    if (fmt === 'feed') {
      btnFeed.className = "py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500 text-stone-950 shadow-sm";
      btnStory.className = "py-2 px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-stone-600 dark:text-stone-300 hover:bg-white/10";
    } else {
      btnStory.className = "py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500 text-stone-950 shadow-sm";
      btnFeed.className = "py-2 px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-stone-600 dark:text-stone-300 hover:bg-white/10";
    }
  }

  renderAdminQuoteCanvas();
}

function setAdminCardTheme(thm) {
  adminCardTheme = thm;
  const themes = ['navy', 'parchment', 'jade'];

  themes.forEach(t => {
    const el = document.getElementById(`admin-theme-${t}`);
    if (el) {
      if (t === thm) {
        el.classList.add('ring-2', 'ring-amber-400', 'scale-105');
      } else {
        el.classList.remove('ring-2', 'ring-amber-400', 'scale-105');
      }
    }
  });

  renderAdminQuoteCanvas();
}

function onAdminCardTextChange() {
  const el = document.getElementById('admin-card-input-text');
  if (el) adminCardQuoteText = el.value;
  renderAdminQuoteCanvas();
}

function onAdminCardMetaChange() {
  const authorEl = document.getElementById('admin-card-input-author');
  const bookEl = document.getElementById('admin-card-input-book');
  if (authorEl) adminCardAuthor = authorEl.value;
  if (bookEl) adminCardBook = bookEl.value;
  renderAdminQuoteCanvas();
}

function renderAdminQuoteCanvas() {
  const canvas = document.getElementById('admin-quote-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = 1080;
  const height = adminCardFormat === 'story' ? 1920 : 1080;
  canvas.width = width;
  canvas.height = height;

  // Theme palettes
  let bgColor = "#0E1B15";
  let bgGradientEnd = "#070E0B";
  let goldColor = "#D4AF37";
  let textColor = "#FBF7EE";
  let subTextColor = "#D8C7A5";
  let watermarkColor = "#8C7345";

  if (adminCardTheme === 'parchment') {
    bgColor = "#F8F4EB";
    bgGradientEnd = "#EFE8D8";
    goldColor = "#B8860B";
    textColor = "#1F2622";
    subTextColor = "#5C5242";
    watermarkColor = "#8A7960";
  } else if (adminCardTheme === 'jade') {
    bgColor = "#0D261B";
    bgGradientEnd = "#06130D";
    goldColor = "#48CAE4";
    textColor = "#F0FDF4";
    subTextColor = "#BBEFDF";
    watermarkColor = "#39806A";
  }

  // 1. Radial background gradient
  const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, bgGradientEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ornate Double Gold Border
  const margin = adminCardFormat === 'story' ? 80 : 60;
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);
  ctx.setLineDash([]);

  // Corner flourishes
  const cornerSize = 40;
  drawCanvasCorner(ctx, margin, margin, cornerSize, goldColor, 0);
  drawCanvasCorner(ctx, width - margin, margin, cornerSize, goldColor, Math.PI / 2);
  drawCanvasCorner(ctx, width - margin, height - margin, cornerSize, goldColor, Math.PI);
  drawCanvasCorner(ctx, margin, height - margin, cornerSize, goldColor, -Math.PI / 2);

  // 3. Header Logo & Title
  ctx.textAlign = "center";
  ctx.font = "bold 20px 'Cinzel', serif";
  ctx.fillStyle = goldColor;
  ctx.letterSpacing = "6px";
  const headerY = adminCardFormat === 'story' ? 220 : 150;
  ctx.fillText("S O P H I A   C O D E X", width / 2, headerY);

  ctx.font = "italic 16px 'Lora', serif";
  ctx.fillStyle = subTextColor;
  ctx.letterSpacing = "2px";
  ctx.fillText("Thư Viện Triết Học & Chiêm Nghiệm Toàn Cầu", width / 2, headerY + 36);

  // Decorative Quote Mark
  ctx.font = "italic 110px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = goldColor;
  ctx.globalAlpha = 0.45;
  const quoteMarkY = adminCardFormat === 'story' ? 440 : 280;
  ctx.fillText("“", width / 2, quoteMarkY);
  ctx.globalAlpha = 1.0;

  // 4. Quote Body
  ctx.font = "500 38px 'Lora', Georgia, serif";
  ctx.fillStyle = textColor;
  ctx.letterSpacing = "0px";

  const maxLineWidth = width - margin * 4;
  const lines = wrapCanvasText(ctx, adminCardQuoteText, maxLineWidth);
  const lineHeight = 64;
  const totalTextHeight = lines.length * lineHeight;
  let startY = (height / 2) - (totalTextHeight / 2) + (adminCardFormat === 'story' ? -60 : -10);

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + (idx * lineHeight));
  });

  // Gold Divider Line
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

  // 5. Author & Book / Context
  ctx.font = "bold 26px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = goldColor;
  ctx.letterSpacing = "1.5px";
  ctx.fillText((adminCardAuthor || 'KHUYẾT DANH').toUpperCase(), width / 2, divY + 54);

  ctx.font = "italic 22px 'Lora', Georgia, serif";
  ctx.fillStyle = subTextColor;
  ctx.fillText(adminCardBook || 'Sophia Codex', width / 2, divY + 92);

  // 6. Watermark Footer
  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillStyle = watermarkColor;
  ctx.letterSpacing = "1px";
  const footerY = height - margin - 35;
  ctx.fillText("📖 Đọc trọn vẹn tại: sophiacodex.vn • 100% Miễn phí & Toàn văn", width / 2, footerY);

  // Render to preview image
  const previewImg = document.getElementById('admin-quote-preview-image');
  if (previewImg) {
    previewImg.src = canvas.toDataURL('image/png');
  }
}

function drawCanvasCorner(ctx, x, y, size, color, angle) {
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

function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  const paragraphs = text.split(/\r?\n/);
  const lines = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  }
  return lines;
}

async function downloadAdminQuotePNG() {
  const canvas = document.getElementById('admin-quote-canvas');
  if (!canvas) return;

  const safeAuthor = (adminCardAuthor || 'quote').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const link = document.createElement('a');
  link.download = `sophia-codex-quote-${adminCardFormat}-${safeAuthor}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  showToast('🎉 Đã xuất và tải ảnh thiệp Facebook HD 1080p thành công!');

  if (adminCardQuoteId) {
    try {
      await fetch(`/api/quotes/${adminCardQuoteId}/share`, { method: 'POST' });
      loadQuotesList();
      loadOverviewDashboard();
    } catch(e) {}
  }
}

function copyAdminQuoteToClipboard() {
  const shareText = `"${adminCardQuoteText}"\n— ${adminCardAuthor} (${adminCardBook})\n\nĐọc sách triết học toàn văn tại: https://sophiacodex.vn #SophiaCodex #TrietHoc #ChiaSeTriThuc`;
  navigator.clipboard.writeText(shareText).then(() => {
    showToast('📋 Đã sao chép trích dẫn & hashtag Facebook!');
  });
}

/**
 * =========================================================================
 * 7. FORM SUBMISSIONS: TẠO SÁCH MỚI & TẠO DANH NGÔN MỚI
 * =========================================================================
 */
async function handleCreateBook(e) {
  e.preventDefault();
  const title = document.getElementById('new-book-title').value.trim();
  const originalTitle = document.getElementById('new-book-original-title').value.trim();
  const author = document.getElementById('new-book-author').value.trim();
  const category = document.getElementById('new-book-category').value;
  const year = document.getElementById('new-book-year').value.trim();
  const tagline = document.getElementById('new-book-tagline').value.trim();
  const summary = document.getElementById('new-book-summary').value.trim();

  const schoolMapping = {
    stoicism: 'Chủ nghĩa Khắc Kỷ',
    eastern: 'Triết học Phương Đông',
    existentialism: 'Chủ nghĩa Hiện sinh',
    classical: 'Cổ Điển Hy Lạp',
    enlightenment: 'Thời kỳ Khai Sáng'
  };

  try {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        original_title: originalTitle,
        author,
        category_id: category,
        school: schoolMapping[category] || 'Triết học',
        year,
        tagline,
        summary,
        status: 'published'
      })
    });

    if (res.ok) {
      closeModal('modal-new-book');
      document.getElementById('form-new-book').reset();
      showToast('🎉 Đã thêm tác phẩm mới vào SQLite thành công!');
      loadOverviewDashboard();
      if (!document.getElementById('tab-books').classList.contains('hidden')) {
        loadBooksList();
      }
    } else {
      showToast('⚠️ Lỗi khi lưu tác phẩm mới');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

async function handleCreateQuote(e) {
  e.preventDefault();
  const quote = document.getElementById('new-quote-text').value.trim();
  const author = document.getElementById('new-quote-author').value.trim();
  const school = document.getElementById('new-quote-school').value.trim();
  const context = document.getElementById('new-quote-context').value.trim();
  const isDaily = document.getElementById('new-quote-set-daily').checked;

  try {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, author, school, context, is_daily: isDaily })
    });

    if (res.ok) {
      closeModal('modal-new-quote');
      document.getElementById('form-new-quote').reset();
      showToast('✨ Đã lưu danh ngôn mới vào SQLite thành công!');
      loadOverviewDashboard();
      if (!document.getElementById('tab-quotes').classList.contains('hidden')) {
        loadQuotesList();
      }
    } else {
      showToast('⚠️ Lỗi khi lưu danh ngôn');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

/**
 * =========================================================================
 * 7.5. PHÂN HỆ HIỀN TRIẾT AI HUB (SOCRATES AI HUB & PLAYGROUND)
 * =========================================================================
 */
let currentAiStreamFilter = 'all';

async function loadAiHub() {
  if (allBooksCache.length === 0) {
    await preloadBooks();
  }
  populateAiBookSelectors();
  await Promise.all([
    loadAiStats(),
    loadAiStream(currentAiStreamFilter)
  ]);
  renderAiPresets();
}

async function loadAiStats() {
  try {
    const res = await fetch('/api/ai/stats');
    if (res.ok) {
      const stats = await res.json();
      const totalEl = document.getElementById('ai-kpi-total');
      const topBookEl = document.getElementById('ai-kpi-top-book');
      const topCountEl = document.getElementById('ai-kpi-top-count');
      if (totalEl) totalEl.textContent = stats.totalConversations || 0;
      if (topBookEl) topBookEl.textContent = stats.topBook || 'Suy Tưởng';
      if (topCountEl) topCountEl.textContent = `${stats.topBookCount || 0} lượt truy vấn`;
    }
  } catch (e) {
    console.error('Lỗi khi tải AI stats:', e);
  }
}

function populateAiBookSelectors() {
  const filterSelect = document.getElementById('ai-filter-book');
  const playgroundSelect = document.getElementById('admin-ai-playground-book');
  
  if (filterSelect) {
    const currentVal = filterSelect.value || 'all';
    filterSelect.innerHTML = '<option value="all">Tất cả tác phẩm</option>' +
      allBooksCache.map(b => `<option value="${b.id}">${b.title}</option>`).join('');
    filterSelect.value = currentVal;
  }

  if (playgroundSelect) {
    const currentVal = playgroundSelect.value;
    playgroundSelect.innerHTML = allBooksCache.map(b => `<option value="${b.id}">${b.title} — ${b.author}</option>`).join('');
    if (currentVal && allBooksCache.some(b => b.id === currentVal)) {
      playgroundSelect.value = currentVal;
    } else if (allBooksCache[0]) {
      playgroundSelect.value = allBooksCache[0].id;
    }
  }
}

async function loadAiStream(bookId = 'all') {
  const streamList = document.getElementById('admin-ai-stream-list');
  if (!streamList) return;

  streamList.innerHTML = '<div class="py-8 text-center text-xs text-stone-400"><i data-lucide="loader" class="w-5 h-5 mx-auto mb-2 animate-spin text-amber-500"></i>Đang tải dữ liệu đàm đạo...</div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const url = bookId && bookId !== 'all' ? `/api/ai/conversations?book_id=${bookId}` : '/api/ai/conversations';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể tải luồng đàm đạo');
    const conversations = await res.json();

    if (!conversations || conversations.length === 0) {
      streamList.innerHTML = `
        <div class="py-12 px-4 text-center text-stone-400 space-y-2">
          <i data-lucide="messages-square" class="w-8 h-8 mx-auto opacity-30 text-amber-500"></i>
          <p class="text-xs">Chưa có lượt đàm đạo nào được ghi nhận cho mục này.</p>
          <button onclick="focusAdminAiPlayground()" class="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all">
            Thử nghiệm đối thoại đầu tiên
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    streamList.innerHTML = conversations.map(c => {
      const bookTitle = c.book_title || 'Triết học kinh điển';
      const timeStr = c.created_at ? new Date(c.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Vừa xong';

      return `
        <div class="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/80 dark:border-emerald-800/50 hover:border-amber-500/40 transition-all space-y-2.5 group">
          <div class="flex items-center justify-between text-[11px]">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                ${escapeHtml(bookTitle)}
              </span>
              <span class="text-stone-400 text-[10px]">${timeStr}</span>
            </div>
            <button onclick="deleteAiConversation(${c.id})" class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all" title="Xóa lượt đàm đạo">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex items-start gap-2">
              <span class="w-5 h-5 rounded-md bg-stone-200 dark:bg-emerald-900 text-stone-700 dark:text-stone-200 flex items-center justify-center text-[10px] font-bold shrink-0">Hỏi</span>
              <p class="font-bold text-stone-900 dark:text-stone-100 leading-relaxed">${escapeHtml(c.question)}</p>
            </div>
            <div class="flex items-start gap-2">
              <span class="w-5 h-5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">AI</span>
              <p class="text-stone-600 dark:text-stone-300 leading-relaxed font-ui text-[11px] line-clamp-3 group-hover:line-clamp-none transition-all">${escapeHtml(c.response)}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    streamList.innerHTML = '<p class="text-xs text-rose-500 p-4">Lỗi khi tải dòng đàm đạo từ SQLite.</p>';
  }
}

function filterAiStream(bookId) {
  currentAiStreamFilter = bookId;
  loadAiStream(bookId);
}

async function deleteAiConversation(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa bản ghi đối thoại này khỏi cơ sở dữ liệu SQLite?')) return;
  try {
    const res = await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('🗑️ Đã xóa lượt đàm đạo thành công!');
      loadAiStream(currentAiStreamFilter);
      loadAiStats();
    } else {
      showToast('⚠️ Không thể xóa bản ghi');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối khi xóa bản ghi');
  }
}

/**
 * Xóa toàn bộ hoặc theo bộ lọc lịch sử đàm đạo AI
 */
async function handleClearAiHistory() {
  const filterSelect = document.getElementById('ai-filter-book');
  const bookId = filterSelect ? filterSelect.value : currentAiStreamFilter;
  const isFiltered = bookId && bookId !== 'all';
  const confirmMsg = isFiltered 
    ? 'Bạn có chắc chắn muốn dọn dẹp toàn bộ lịch sử đàm đạo của tác phẩm đang lọc khỏi SQLite?' 
    : 'Bạn có chắc chắn muốn dọn sạch TOÀN BỘ lịch sử đàm đạo AI khỏi SQLite?';

  if (!confirm(confirmMsg)) return;

  try {
    const url = isFiltered ? `/api/ai/conversations?book_id=${encodeURIComponent(bookId)}` : '/api/ai/conversations';
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      showToast('🗑️ Đã dọn dẹp lịch sử đàm đạo thành công!');
      loadAiStream(currentAiStreamFilter);
      loadAiStats();
      loadOverviewDashboard();
    } else {
      showToast('⚠️ Không thể dọn dẹp lịch sử AI');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối khi xóa lịch sử AI');
  }
}

function focusAdminAiPlayground() {
  const input = document.getElementById('admin-ai-playground-input');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function sendPlaygroundPreset(question) {
  const input = document.getElementById('admin-ai-playground-input');
  if (input) {
    input.value = question;
    handleAdminAiPlaygroundSubmit(new Event('submit'));
  }
}

async function handleAdminAiPlaygroundSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('admin-ai-playground-input');
  const chatContainer = document.getElementById('admin-ai-playground-chat');
  const bookSelect = document.getElementById('admin-ai-playground-book');
  if (!input || !chatContainer) return;

  const question = input.value.trim();
  if (!question) return;

  const bookId = bookSelect ? bookSelect.value : (allBooksCache[0]?.id || 'suy-tuong');
  const selectedBook = allBooksCache.find(b => b.id === bookId) || { title: 'Tác Phẩm', author: 'Hiền Triết' };

  input.value = '';

  // Append user message
  const userHtml = `
    <div class="flex justify-end gap-2 animate-fade-in">
      <div class="p-2.5 rounded-2xl bg-emerald-900 text-stone-100 max-w-[85%] leading-relaxed shadow-sm">
        ${escapeHtml(question)}
      </div>
    </div>
  `;
  chatContainer.insertAdjacentHTML('beforeend', userHtml);

  // Append spinner
  const loadingId = 'ai-loading-' + Date.now();
  const loadingHtml = `
    <div id="${loadingId}" class="flex gap-2.5 items-start animate-fade-in">
      <div class="w-6 h-6 rounded-lg bg-emerald-950 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">S</div>
      <div class="p-2.5 rounded-2xl bg-stone-100 dark:bg-emerald-900/50 text-stone-500 italic text-[11px] flex items-center gap-1.5">
        <i data-lucide="loader" class="w-3.5 h-3.5 animate-spin text-amber-500"></i> Đang chiêm nghiệm và phản biện...
      </div>
    </div>
  `;
  chatContainer.insertAdjacentHTML('beforeend', loadingHtml);
  if (window.lucide) window.lucide.createIcons();
  chatContainer.scrollTop = chatContainer.scrollHeight;

  setTimeout(async () => {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    let answer = '';
    const lower = question.toLowerCase();
    if (lower.includes('nguyên lý kiểm soát') || lower.includes('kiểm soát')) {
      answer = `Theo ${selectedBook.author} trong "${selectedBook.title}", cốt lõi của bình thản là sự phân định rạch ròi: Thứ nằm trong tầm kiểm soát (ý chí, phán xét, hành vi) và thứ ngoài tầm kiểm soát (danh vọng, thời cuộc, phán xét của người khác). Đau khổ chỉ nảy sinh khi ta cố gắng làm chủ những điều bất khả làm chủ.`;
    } else if (lower.includes('vô vi') || lower.includes('đạo') || lower.includes('quản trị')) {
      answer = `Trong nghệ thuật quản trị theo "${selectedBook.title}", "Vô vi" không phải là bỏ mặc mà là hành động thuận theo tự nhiên và năng lực của từng cá nhân. Một người lãnh đạo sáng suốt là người tạo ra môi trường tự vận hành và dẫn dắt bằng tấm gương đạo đức.`;
    } else if (lower.includes('phản biện') || lower.includes('câu hỏi') || lower.includes('đố')) {
      answer = `Một câu hỏi Socrates dành cho bạn: "Nếu tất cả những gì bạn đang dốc lòng tích lũy ngày hôm nay biến mất vào ngày mai, phẩm chất nào bên trong bạn sẽ là chỗ dựa vững chắc nhất?"`;
    } else {
      answer = `Chiêm nghiệm sâu sắc từ "${selectedBook.title}": Khi đối diện với các nghịch cảnh đời thường, ${selectedBook.author} khuyên chúng ta hãy nhìn sâu vào bản chất của sự việc, không phản ứng bộc phát và luôn giữ cho mình một tâm trí không bị xáo trộn.`;
    }

    // Save to SQLite
    try {
      await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          question: question,
          response: answer
        })
      });
    } catch (e) {
      console.error('Lỗi lưu đối thoại AI:', e);
    }

    const aiHtml = `
      <div class="flex gap-2.5 items-start animate-fade-in">
        <div class="w-6 h-6 rounded-lg bg-emerald-950 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">S</div>
        <div class="p-2.5 rounded-2xl bg-stone-100 dark:bg-emerald-900/50 text-stone-800 dark:text-stone-200 leading-relaxed font-ui max-w-[90%] shadow-sm">
          <div class="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">Hiền Triết Socrates (${selectedBook.title})</div>
          ${escapeHtml(answer)}
        </div>
      </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', aiHtml);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    loadAiStream(currentAiStreamFilter);
    loadAiStats();
  }, 900);
}

function renderAiPresets() {
  const container = document.getElementById('admin-ai-presets-grid');
  if (!container) return;

  const presets = [
    {
      category: 'Khắc Kỷ',
      icon: 'shield',
      color: 'amber',
      question: 'Làm thế nào để phân biệt điều nằm trong và ngoài tầm kiểm soát?',
      hint: 'Áp dụng Dichotomy of Control của Epictetus & Marcus Aurelius vào áp lực công việc hàng ngày.'
    },
    {
      category: 'Đạo Gia',
      icon: 'droplets',
      color: 'emerald',
      question: 'Ý nghĩa triết học của "Vô vi" trong quản trị hiện đại?',
      hint: 'Học cách lãnh đạo thuận theo quy luật tự nhiên, giảm thiểu xung đột cưỡng ép.'
    },
    {
      category: 'Hiện Sinh',
      icon: 'compass',
      color: 'purple',
      question: 'Làm thế nào để kiến tạo ý nghĩa sống giữa nghịch cảnh và mất mát?',
      hint: 'Chiêm nghiệm tư tưởng Nietzsche và Frankl về ý chí sinh tồn qua khủng hoảng.'
    },
    {
      category: 'Cổ Điển Hy Lạp',
      icon: 'landmark',
      color: 'blue',
      question: 'Tại sao "Biết mình không biết gì" là khởi đầu của trí tuệ?',
      hint: 'Phương pháp tự vấn Socrates giúp giải phóng tâm trí khỏi những định kiến sai lầm.'
    },
    {
      category: 'Khai Sáng',
      icon: 'sun',
      color: 'rose',
      question: 'Dũng khí dám dùng lý trí của chính mình (Sapere Aude) là gì?',
      hint: 'Tư tưởng Immanuel Kant về sự trưởng thành tinh thần và tự do tư tưởng.'
    },
    {
      category: 'Thực Hành Chiêm Nghiệm',
      icon: 'heart',
      color: 'amber',
      question: 'Cách đối diện với nỗi sợ cái chết (Memento Mori) để trân quý hiện tại?',
      hint: 'Seneca và các triết gia La Mã khuyên ta sống trọn vẹn từng ngày như một kiệt tác.'
    }
  ];

  container.innerHTML = presets.map(p => `
    <div class="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/80 dark:border-emerald-800/50 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-${p.color}-500/10 text-${p.color}-700 dark:text-${p.color}-400 border border-${p.color}-500/20">
            ${p.category}
          </span>
          <i data-lucide="${p.icon}" class="w-3.5 h-3.5 text-stone-400"></i>
        </div>
        <h5 class="font-bold text-stone-900 dark:text-stone-100 text-xs leading-snug">
          ${p.question}
        </h5>
        <p class="text-[11px] text-stone-500 leading-relaxed">
          ${p.hint}
        </p>
      </div>

      <button onclick="sendPlaygroundPreset('${p.question.replace(/'/g, "\\'")}')" class="w-full py-2 px-3 rounded-xl bg-white dark:bg-emerald-950 border border-stone-300 dark:border-emerald-800 hover:border-amber-500 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-sm">
        <i data-lucide="play" class="w-3 h-3 text-amber-500"></i>
        <span>Thử ngay trong Playground</span>
      </button>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * =========================================================================
 * 7.6. PHÂN HỆ BẬC THẦY & DÒNG THỜI GIAN LỊCH SỬ (PHILOSOPHERS STUDIO & TIMELINE)
 * =========================================================================
 */
let allPhilosophersCache = [];
let currentPhilosopherFilter = 'all';
let currentPhilosopherView = 'cards';

async function loadPhilosophersTab() {
  if (allBooksCache.length === 0) {
    await preloadBooks();
  }
  populatePhilosopherBookSelector();
  await Promise.all([
    loadPhilosophersStats(),
    loadPhilosophersList()
  ]);
}

function populatePhilosopherBookSelector() {
  const bookSelect = document.getElementById('phil-edit-book-id');
  if (!bookSelect) return;
  bookSelect.innerHTML = '<option value="">-- Không liên kết tác phẩm --</option>' +
    allBooksCache.map(b => `<option value="${b.id}">${b.title} (${b.author})</option>`).join('');
}

async function loadPhilosophersStats() {
  try {
    const res = await fetch('/api/philosophers/stats');
    if (res.ok) {
      const stats = await res.json();
      const totalEl = document.getElementById('phil-kpi-total');
      const schoolsEl = document.getElementById('phil-kpi-schools');
      const booksEl = document.getElementById('phil-kpi-books');
      const eraEl = document.getElementById('phil-kpi-era');

      if (totalEl) totalEl.textContent = stats.totalPhilosophers || 0;
      if (schoolsEl) schoolsEl.textContent = stats.totalSchools || 0;
      if (booksEl) booksEl.textContent = stats.linkedBooksCount || 0;
      if (eraEl) eraEl.textContent = stats.eraSpan || '2600 Năm Lịch Sử';
    }
  } catch (err) {
    console.error('Lỗi nạp thống kê triết gia:', err);
  }
}

async function loadPhilosophersList() {
  const container = document.getElementById('philosophers-cards-view');
  if (container) {
    container.innerHTML = '<div class="col-span-full py-8 text-center text-xs text-stone-400"><i data-lucide="loader" class="w-5 h-5 mx-auto mb-2 animate-spin text-amber-500"></i>Đang tải danh sách bậc thầy triết học từ SQLite...</div>';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch('/api/philosophers');
    if (!res.ok) throw new Error('Không thể tải danh sách triết gia');
    allPhilosophersCache = await res.json();

    renderPhilosophersCards();
    renderPhilosophersTimeline();
  } catch (err) {
    if (container) {
      container.innerHTML = '<p class="text-xs text-rose-500 col-span-full py-4 text-center">Lỗi khi nạp dữ liệu triết gia từ SQLite.</p>';
    }
  }
}

function togglePhilosophersView(view) {
  currentPhilosopherView = view;
  const cardsView = document.getElementById('philosophers-cards-view');
  const timelineView = document.getElementById('philosophers-timeline-view');
  const cardsBtn = document.getElementById('phil-view-cards-btn');
  const timelineBtn = document.getElementById('phil-view-timeline-btn');

  if (view === 'cards') {
    if (cardsView) cardsView.classList.remove('hidden');
    if (timelineView) timelineView.classList.add('hidden');
    if (cardsBtn) cardsBtn.className = "px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-emerald-900 text-amber-600 dark:text-amber-300 shadow-sm transition-all flex items-center gap-1.5";
    if (timelineBtn) timelineBtn.className = "px-3 py-1.5 rounded-lg font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all flex items-center gap-1.5";
  } else {
    if (cardsView) cardsView.classList.add('hidden');
    if (timelineView) timelineView.classList.remove('hidden');
    if (cardsBtn) cardsBtn.className = "px-3 py-1.5 rounded-lg font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all flex items-center gap-1.5";
    if (timelineBtn) timelineBtn.className = "px-3 py-1.5 rounded-lg font-bold bg-white dark:bg-emerald-900 text-amber-600 dark:text-amber-300 shadow-sm transition-all flex items-center gap-1.5";
  }

  if (window.lucide) window.lucide.createIcons();
}

function filterAdminPhilosophers(school) {
  currentPhilosopherFilter = school;
  document.querySelectorAll('.admin-phil-filter').forEach(btn => {
    btn.className = "admin-phil-filter px-3.5 py-1.5 rounded-xl font-medium bg-white dark:bg-emerald-950/60 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800 transition-all";
  });

  const activeBtnMap = {
    'all': 'phil-filter-all',
    'Khắc Kỷ': 'phil-filter-stoicism',
    'Đạo Gia': 'phil-filter-eastern',
    'Hiện sinh': 'phil-filter-existentialism',
    'Cổ điển Hy Lạp': 'phil-filter-classical',
    'Khai Sáng': 'phil-filter-enlightenment'
  };

  const btnId = activeBtnMap[school] || 'phil-filter-all';
  const activeBtn = document.getElementById(btnId);
  if (activeBtn) {
    activeBtn.className = "admin-phil-filter px-3.5 py-1.5 rounded-xl font-bold bg-emerald-950 text-amber-300 border border-amber-500/30 transition-all";
  }

  renderPhilosophersCards();
}

function renderPhilosophersCards() {
  const container = document.getElementById('philosophers-cards-view');
  if (!container) return;

  let list = allPhilosophersCache;
  if (currentPhilosopherFilter !== 'all') {
    list = list.filter(p => (p.school || '').toLowerCase().includes(currentPhilosopherFilter.toLowerCase()));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-stone-400 space-y-2">
        <i data-lucide="landmark" class="w-8 h-8 mx-auto opacity-30 text-amber-500"></i>
        <p class="text-xs">Không tìm thấy bậc thầy nào trong bộ lọc này.</p>
        <button onclick="openNewPhilosopherModal()" class="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all">
          + Khai báo bậc thầy mới
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(p => {
    const fallback = p.fallback_avatar || 'assets/covers/suy-tuong.svg';
    const bookTitle = p.book_title || (p.book_id ? p.book_id : null);

    return `
      <div class="p-5 rounded-3xl bg-white dark:bg-[#111E17] border border-stone-200/90 dark:border-emerald-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
        <div>
          <!-- Header with Avatar and Meta -->
          <div class="flex items-start gap-3.5 mb-3">
            <div class="relative w-14 h-14 rounded-2xl p-0.5 border-2 border-amber-500/50 group-hover:border-amber-500 transition-all shadow-md overflow-hidden bg-stone-200 shrink-0">
              <img src="${p.avatar || fallback}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover rounded-2xl filter contrast-105" onerror="this.onerror=null; this.src='${fallback}'">
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate">
                ${escapeHtml(p.name)}
              </h4>
              <div class="text-[11px] text-stone-500 truncate">${escapeHtml(p.title || 'Hiền triết')}</div>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                  ${escapeHtml(p.school || 'Triết học')}
                </span>
                <span class="text-[10px] text-stone-400 font-mono">${escapeHtml(p.era || '')}</span>
              </div>
            </div>
          </div>

          <!-- Quote Block -->
          <div class="p-3 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/70 dark:border-emerald-800/40 text-xs text-stone-700 dark:text-stone-300 italic font-reading leading-relaxed mb-3">
            "${escapeHtml(p.quote || 'Trí tuệ là ngọn đèn dẫn lối.')}"
          </div>

          <!-- Bio Excerpt -->
          <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">
            ${escapeHtml(p.bio || '')}
          </p>

          <!-- Linked Book Pill -->
          ${bookTitle ? `
            <div class="mt-3 flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[11px]">
              <i data-lucide="book-open" class="w-3.5 h-3.5 shrink-0 text-amber-500"></i>
              <span class="truncate font-semibold">Tác phẩm: ${escapeHtml(bookTitle)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Action Footer -->
        <div class="pt-3 border-t border-stone-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5">
            <button onclick="openEditPhilosopherModal('${p.id}')" class="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950 hover:bg-stone-200 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-emerald-800 font-bold text-[11px] flex items-center gap-1 transition-all">
              <i data-lucide="edit-3" class="w-3 h-3 text-amber-500"></i>
              <span>Sửa</span>
            </button>
            <button onclick="handleDeletePhilosopher('${p.id}')" class="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Xóa Bậc Thầy">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          ${p.book_id ? `
            <button onclick="openChaptersForBook('${p.book_id}')" class="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              <span>Mở chương mục</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderPhilosophersTimeline() {
  const flowContainer = document.getElementById('admin-philosophers-timeline-flow');
  if (!flowContainer) return;

  const eraOrder = [
    'Thế kỷ 6 TCN',
    '428 – 348 TCN',
    '121 – 180 SCN',
    '1806 – 1873',
    '1844 – 1900'
  ];

  const sortedList = [...allPhilosophersCache].sort((a, b) => {
    const idxA = eraOrder.indexOf(a.era);
    const idxB = eraOrder.indexOf(b.era);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  flowContainer.innerHTML = sortedList.map((p, idx) => {
    const fallback = p.fallback_avatar || 'assets/covers/suy-tuong.svg';

    return `
      <div class="relative group">
        <!-- Epoch Dot -->
        <div class="absolute -left-6 md:-left-8 top-1.5 w-6 h-6 rounded-full bg-emerald-950 border-2 border-amber-500 text-amber-300 flex items-center justify-center text-[10px] font-bold shadow-md group-hover:scale-110 transition-transform">
          ${idx + 1}
        </div>

        <!-- Timeline Content Box -->
        <div class="p-5 rounded-3xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/80 dark:border-emerald-800/50 hover:border-amber-500/50 transition-all space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <img src="${p.avatar || fallback}" alt="${escapeHtml(p.name)}" class="w-10 h-10 rounded-full object-cover border border-amber-500/40" onerror="this.onerror=null; this.src='${fallback}'">
              <div>
                <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">${escapeHtml(p.name)}</h4>
                <div class="text-[11px] text-stone-500">${escapeHtml(p.title || '')} • <span class="text-amber-600 dark:text-amber-400 font-semibold">${escapeHtml(p.school || '')}</span></div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold font-mono text-xs self-start sm:self-auto border border-amber-500/25">
              ${escapeHtml(p.era || 'Biên niên sử')}
            </span>
          </div>

          <p class="text-xs text-stone-600 dark:text-stone-300 italic font-reading bg-white dark:bg-emerald-950 p-3 rounded-2xl border border-stone-200/60 dark:border-emerald-900/40">
            "${escapeHtml(p.quote || '')}"
          </p>

          <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            ${escapeHtml(p.bio || '')}
          </p>

          <div class="flex items-center justify-between pt-1 text-[11px]">
            ${p.book_title ? `
              <span class="text-stone-400">Tác phẩm toàn văn: <strong class="text-stone-700 dark:text-stone-200">${escapeHtml(p.book_title)}</strong></span>
            ` : '<span></span>'}
            <button onclick="openEditPhilosopherModal('${p.id}')" class="font-bold text-amber-600 dark:text-amber-400 hover:underline">
              Chỉnh sửa hồ sơ →
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openNewPhilosopherModal() {
  document.getElementById('form-philosopher-editor').reset();
  document.getElementById('phil-edit-mode').value = 'create';
  document.getElementById('philosopher-modal-title').textContent = 'Khai Báo Bậc Thầy Triết Học Mới';
  
  const idInput = document.getElementById('phil-edit-id');
  if (idInput) {
    idInput.readOnly = false;
    idInput.classList.remove('bg-stone-100', 'cursor-not-allowed');
  }

  populatePhilosopherBookSelector();
  openModal('modal-philosopher-editor');
}

function openEditPhilosopherModal(id) {
  const p = allPhilosophersCache.find(item => item.id === id);
  if (!p) return;

  populatePhilosopherBookSelector();
  document.getElementById('phil-edit-mode').value = 'edit';
  document.getElementById('philosopher-modal-title').textContent = `Chỉnh Sửa Hồ Sơ: ${p.name}`;

  const idInput = document.getElementById('phil-edit-id');
  if (idInput) {
    idInput.value = p.id;
    idInput.readOnly = true;
    idInput.classList.add('bg-stone-100', 'cursor-not-allowed');
  }

  document.getElementById('phil-edit-name').value = p.name || '';
  document.getElementById('phil-edit-title').value = p.title || '';
  document.getElementById('phil-edit-era').value = p.era || '';
  document.getElementById('phil-edit-school').value = p.school || '';
  document.getElementById('phil-edit-book-id').value = p.book_id || '';
  document.getElementById('phil-edit-avatar').value = p.avatar || '';
  document.getElementById('phil-edit-fallback').value = p.fallback_avatar || '';
  document.getElementById('phil-edit-quote').value = p.quote || '';
  document.getElementById('phil-edit-bio').value = p.bio || '';

  openModal('modal-philosopher-editor');
}

async function handleSavePhilosopher(e) {
  e.preventDefault();
  const mode = document.getElementById('phil-edit-mode').value;
  const id = document.getElementById('phil-edit-id').value.trim();
  const name = document.getElementById('phil-edit-name').value.trim();
  const title = document.getElementById('phil-edit-title').value.trim();
  const era = document.getElementById('phil-edit-era').value.trim();
  const school = document.getElementById('phil-edit-school').value.trim();
  const bookId = document.getElementById('phil-edit-book-id').value || null;
  const avatar = document.getElementById('phil-edit-avatar').value.trim();
  const fallbackAvatar = document.getElementById('phil-edit-fallback').value.trim();
  const quote = document.getElementById('phil-edit-quote').value.trim();
  const bio = document.getElementById('phil-edit-bio').value.trim();

  const payload = {
    id,
    name,
    title,
    era,
    school,
    book_id: bookId,
    avatar,
    fallback_avatar: fallbackAvatar,
    quote,
    bio
  };

  try {
    const url = mode === 'create' ? '/api/philosophers' : `/api/philosophers/${id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('modal-philosopher-editor');
      showToast(`✨ Đã ${mode === 'create' ? 'thêm' : 'cập nhật'} Bậc Thầy "${name}" thành công!`);
      loadPhilosophersTab();
    } else {
      showToast('⚠️ Lỗi khi lưu dữ liệu triết gia');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

async function handleDeletePhilosopher(id) {
  const p = allPhilosophersCache.find(item => item.id === id);
  const name = p ? `"${p.name}"` : 'Bậc Thầy này';
  if (!confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa ${name} khỏi SQLite?`)) return;

  try {
    const res = await fetch(`/api/philosophers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`🗑️ Đã xóa Bậc Thầy thành công!`);
      loadPhilosophersTab();
    } else {
      showToast('⚠️ Không thể xóa triết gia');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API khi xóa');
  }
}

/**
 * =========================================================================
 * 7.7. PHÂN HỆ ÂM THANH & NHẠC NỀN STUDIO (AUDIO STUDIO & BGM CONSOLE)
 * =========================================================================
 */
let adminBgmEngine = null;
let adminIsBgmPlaying = false;
let adminBgmCurrentBook = 'suy-tuong';
let adminWaveInterval = null;

async function loadAudioStudioTab() {
  if (allBooksCache.length === 0) {
    await preloadBooks();
  }
  renderAudioBooksList();
  updateAudioKPIs();
}

function updateAudioKPIs() {
  const booksWithAudio = allBooksCache.filter(b => b.studio_audio_url || b.audio_duration);
  const countEl = document.getElementById('audio-kpi-books');
  const durEl = document.getElementById('audio-kpi-duration');

  if (countEl) countEl.textContent = `${booksWithAudio.length} / ${allBooksCache.length}`;
  if (durEl) {
    durEl.textContent = `${(allBooksCache.length * 2.5).toFixed(1)} giờ`;
  }
}

function renderAudioBooksList() {
  const container = document.getElementById('admin-audio-books-list');
  if (!container) return;

  if (allBooksCache.length === 0) {
    container.innerHTML = '<p class="text-xs text-stone-400 py-6 text-center">Đang tải danh sách tác phẩm...</p>';
    return;
  }

  const bgmThemeLabels = {
    'harp': '🏛️ Đàn Hạc Thư Phòng (Harp)',
    'lyre': '🏺 Đàn Lia Cổ Điển (Lyre)',
    'zen-flute': '🎋 Sáo Trúc & Chuông Thiền (Flute)',
    'strings': '🏔️ Vĩ Cầm Núi Tuyết (Strings)',
    'piano': '🏛️ Thính Phòng Oxford (Piano)'
  };

  container.innerHTML = allBooksCache.map(b => {
    const streamUrl = b.studio_audio_url || '';
    const bgmTheme = b.bgm_theme || 'harp';
    const bgmLabel = bgmThemeLabels[bgmTheme] || 'Giai điệu thiền định';
    const duration = b.audio_duration || '2 giờ';

    return `
      <div class="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200/80 dark:border-emerald-800/50 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
        <div class="flex items-center gap-3.5 min-w-0 flex-1">
          <img src="${b.cover_image || 'assets/covers/suy-tuong.svg'}" alt="${escapeHtml(b.title)}" class="w-11 h-16 object-cover rounded-xl shadow-sm border border-stone-200 dark:border-emerald-800 shrink-0">
          <div class="min-w-0 flex-1 space-y-1">
            <h4 class="font-bold text-xs md:text-sm text-stone-900 dark:text-stone-100 truncate">${escapeHtml(b.title)}</h4>
            <div class="text-[11px] text-stone-500 truncate">${escapeHtml(b.author)} • <span class="text-amber-600 dark:text-amber-400 font-semibold">${escapeHtml(b.school || '')}</span></div>
            <div class="flex flex-wrap items-center gap-2 pt-0.5 text-[10px]">
              <span class="px-2 py-0.5 rounded-md font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                ${bgmLabel}
              </span>
              <span class="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-emerald-900 text-stone-700 dark:text-stone-300 font-mono">
                ${escapeHtml(duration)}
              </span>
              ${streamUrl ? `
                <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Stream Sẵn Sàng
                </span>
              ` : `
                <span class="text-stone-400 italic">TTS Học Giả AI</span>
              `}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 dark:border-emerald-900/60">
          <button onclick="testBookBgm('${b.id}')" class="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all" title="Nghe thử BGM">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
            <span>Nghe Thử</span>
          </button>
          <button onclick="openEditAudioModal('${b.id}')" class="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-950 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-all" title="Cấu hình nguồn audio">
            <i data-lucide="settings" class="w-3.5 h-3.5 text-stone-400"></i>
            <span>Cấu Hình</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function focusAdminBgmTester() {
  const consoleEl = document.getElementById('admin-audio-console');
  if (consoleEl) {
    consoleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function testBookBgm(bookId) {
  const select = document.getElementById('admin-bgm-soundscape-select');
  if (select) {
    select.value = bookId;
  }
  adminBgmCurrentBook = bookId;
  focusAdminBgmTester();
  if (!adminIsBgmPlaying) {
    toggleAdminBgmPlay();
  } else {
    stopAdminBgmPlay();
    toggleAdminBgmPlay();
  }
}

function changeAdminBgmSoundscape(bookId) {
  adminBgmCurrentBook = bookId;
  if (adminIsBgmPlaying) {
    stopAdminBgmPlay();
    toggleAdminBgmPlay();
  }
}

function toggleAdminBgmPlay() {
  if (adminIsBgmPlaying) {
    stopAdminBgmPlay();
  } else {
    startAdminBgmPlay();
  }
}

function startAdminBgmPlay() {
  try {
    if (typeof BGMEngine !== 'undefined') {
      if (!adminBgmEngine) {
        adminBgmEngine = new BGMEngine();
      }
      const vol = (parseInt(document.getElementById('admin-bgm-volume')?.value || '35')) / 100;
      adminBgmEngine.volume = vol;
      adminBgmEngine.play(adminBgmCurrentBook);
    }

    adminIsBgmPlaying = true;
    updateBgmPlayUI(true);
    startWaveAnimation();
    showToast('🎵 Đang phát giai điệu thiền định Web Audio Synthesizer!');
  } catch (err) {
    console.error('Lỗi phát BGM:', err);
    showToast('⚠️ Không thể khởi động Web Audio API');
  }
}

function stopAdminBgmPlay() {
  try {
    if (adminBgmEngine) {
      if (typeof adminBgmEngine.stop === 'function') adminBgmEngine.stop();
      else if (typeof adminBgmEngine.pause === 'function') adminBgmEngine.pause();
    }
  } catch(e) {}

  adminIsBgmPlaying = false;
  updateBgmPlayUI(false);
  stopWaveAnimation();
}

function updateBgmPlayUI(isPlaying) {
  const btn = document.getElementById('admin-bgm-play-btn');
  const text = document.getElementById('admin-bgm-play-text');
  const dot = document.getElementById('admin-audio-status-dot');

  if (isPlaying) {
    if (btn) btn.className = "flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]";
    if (text) text.textContent = "Tạm Dừng Giai Điệu BGM";
    if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
  } else {
    if (btn) btn.className = "flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]";
    if (text) text.textContent = "Phát Thử Giai Điệu BGM";
    if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600";
  }
}

function setAdminBgmVolume(val) {
  const text = document.getElementById('admin-bgm-vol-text');
  if (text) text.textContent = `${val}%`;
  if (adminBgmEngine) {
    adminBgmEngine.volume = parseInt(val) / 100;
  }
}

function startWaveAnimation() {
  stopWaveAnimation();
  const bars = document.querySelectorAll('#admin-waveform-container .wave-bar');
  adminWaveInterval = setInterval(() => {
    bars.forEach(bar => {
      const height = Math.floor(Math.random() * 45) + 6;
      bar.style.height = `${height}px`;
    });
  }, 120);
}

function stopWaveAnimation() {
  if (adminWaveInterval) clearInterval(adminWaveInterval);
  const bars = document.querySelectorAll('#admin-waveform-container .wave-bar');
  bars.forEach(bar => bar.style.height = '6px');
}

function speakAdminTtsSample() {
  const input = document.getElementById('admin-tts-sample-text');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  if (!window.speechSynthesis) {
    showToast('⚠️ Trình duyệt không hỗ trợ Web Speech Synthesis');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.pitch = 0.82;
  utterance.rate = 0.86;

  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
  if (viVoice) utterance.voice = viVoice;

  window.speechSynthesis.speak(utterance);
  showToast('🗣️ Đang đọc giọng mẫu Học Giả AI (Warm Bass TTS)...');
}

function openEditAudioModal(bookId) {
  const book = allBooksCache.find(b => b.id === bookId);
  if (!book) return;

  document.getElementById('audio-edit-book-id').value = book.id;
  document.getElementById('audio-edit-book-title').value = `${book.title} (${book.author})`;
  document.getElementById('audio-edit-stream-url').value = book.studio_audio_url || '';
  document.getElementById('audio-edit-bgm-theme').value = book.bgm_theme || 'harp';
  document.getElementById('audio-edit-duration').value = book.audio_duration || '2 giờ';

  openModal('modal-audio-editor');
}

async function handleSaveAudioConfig(e) {
  e.preventDefault();
  const bookId = document.getElementById('audio-edit-book-id').value;
  const studioAudioUrl = document.getElementById('audio-edit-stream-url').value.trim();
  const bgmTheme = document.getElementById('audio-edit-bgm-theme').value;
  const audioDuration = document.getElementById('audio-edit-duration').value.trim();

  try {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studio_audio_url: studioAudioUrl,
        bgm_theme: bgmTheme,
        audio_duration: audioDuration
      })
    });

    if (res.ok) {
      closeModal('modal-audio-editor');
      showToast('✨ Đã cập nhật cấu hình luồng âm thanh thành công!');
      await preloadBooks();
      renderAudioBooksList();
      updateAudioKPIs();
    } else {
      showToast('⚠️ Lỗi khi lưu cấu hình âm thanh');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối API');
  }
}

/**
 * =========================================================================
 * 8. SỨC KHỎE CƠ SỞ DỮ LIỆU & SAO LƯU (BACKUP & HEALTH)
 * =========================================================================
 */
async function triggerDbBackup() {
  showToast('💾 Đang tạo bản sao lưu SQLite an toàn...');
  try {
    const res = await fetch('/api/db/backup', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`✅ Đã sao lưu thành công tệp: ${data.backupFile.split(/[\/\\]/).pop()}`);
    } else {
      showToast('⚠️ Không thể sao lưu CSDL');
    }
  } catch (err) {
    showToast('⚠️ Lỗi kết nối khi sao lưu');
  }
}

async function openDbHealthModal() {
  openModal('modal-db-health');
  const detailsEl = document.getElementById('db-health-details');
  if (!detailsEl) return;
  detailsEl.innerHTML = '<p class="text-stone-400">Đang kiểm tra SQLite engine...</p>';

  try {
    const res = await fetch('/api/db/health');
    const health = await res.json();

    detailsEl.innerHTML = `
      <div class="p-3 rounded-2xl bg-stone-100 dark:bg-emerald-950/60 space-y-2 border border-stone-200 dark:border-emerald-800">
        <div class="flex items-center justify-between">
          <span class="text-stone-500">Động cơ lưu trữ:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">${health.engine}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-stone-500">Tệp cơ sở dữ liệu:</span>
          <span class="font-mono text-[11px] text-stone-700 dark:text-stone-300 truncate max-w-[240px]">${health.dbPath}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-stone-500">Dung lượng hiện tại:</span>
          <span class="font-bold text-stone-900 dark:text-amber-300 font-mono">${health.sizeKb} KB</span>
        </div>
      </div>

      <div class="space-y-1.5 pt-1">
        <span class="font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px]">Thống kê bản ghi 7 bảng dữ liệu SQLite:</span>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center">
            <span class="text-stone-500">Tác phẩm:</span>
            <span class="font-bold font-mono text-amber-600">${health.tables.books || 0}</span>
          </div>
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center">
            <span class="text-stone-500">Chương mục:</span>
            <span class="font-bold font-mono text-emerald-600">${health.tables.chapters || 0}</span>
          </div>
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center">
            <span class="text-stone-500">Danh ngôn:</span>
            <span class="font-bold font-mono text-blue-600">${health.tables.quotes || 0}</span>
          </div>
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center">
            <span class="text-stone-500">Triết gia:</span>
            <span class="font-bold font-mono text-indigo-600">${health.tables.philosophers || 0}</span>
          </div>
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center">
            <span class="text-stone-500">Trường phái:</span>
            <span class="font-bold font-mono text-teal-600">${health.tables.categories || 0}</span>
          </div>
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center">
            <span class="text-stone-500">Đàm đạo AI:</span>
            <span class="font-bold font-mono text-rose-600">${health.tables.aiConversations || 0}</span>
          </div>
          <div class="p-2 rounded-xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 flex justify-between items-center col-span-2 sm:col-span-1">
            <span class="text-stone-500">Phiên đọc:</span>
            <span class="font-bold font-mono text-purple-600">${health.tables.readingLogs || 0}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    detailsEl.innerHTML = '<p class="text-rose-500">Lỗi khi kết nối kiểm tra CSDL.</p>';
  }
}

/**
 * =========================================================================
 * 9. MODALS, TOAST, THEME & QUICK SEARCH
 * =========================================================================
 */
function openNewBookModal() {
  openModal('modal-new-book');
}

function openNewQuoteModal() {
  openModal('modal-new-quote');
}

function openSmartIngestModal() {
  openModal('modal-smart-ingest');
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
}

let adminToastTimer = null;
function showToast(message) {
  const toast = document.getElementById('admin-toast');
  const msgEl = document.getElementById('admin-toast-message');
  if (!toast || !msgEl) return;

  if (adminToastTimer) {
    clearTimeout(adminToastTimer);
    adminToastTimer = null;
  }

  msgEl.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

  adminToastTimer = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    adminToastTimer = null;
  }, 3500);
}

function initTheme() {
  const saved = localStorage.getItem('sophia_admin_theme') || 'light';
  setTheme(saved);
}

function setTheme(theme) {
  localStorage.setItem('sophia_admin_theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function initShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Escape to close any open modal
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('[id^="modal-"]:not(.hidden)');
      if (openModals.length > 0) {
        e.preventDefault();
        openModals.forEach(m => closeModal(m.id));
      }
    }

    // Ctrl+S / Cmd+S in chapter editor modal to save
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      const chapModal = document.getElementById('modal-chapter-editor');
      if (chapModal && !chapModal.classList.contains('hidden')) {
        e.preventDefault();
        const form = document.getElementById('form-chapter-editor');
        if (form) form.requestSubmit();
      }
    }

    // Quick search shortcut: Ctrl+K or '/'
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('admin-search-input');
      if (input) {
        input.focus();
        input.select();
      }
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      const input = document.getElementById('admin-search-input');
      if (input) {
        input.focus();
        input.select();
      }
    }
  });
}

function initModalBackdropDismiss() {
  document.querySelectorAll('[id^="modal-"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

function initSearch() {
  const input = document.getElementById('admin-search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();

    // If currently on Books tab
    if (!document.getElementById('tab-books').classList.contains('hidden')) {
      const cards = document.querySelectorAll('#admin-books-grid > div');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // If currently on Chapters tab
    if (!document.getElementById('tab-chapters').classList.contains('hidden')) {
      const rows = document.querySelectorAll('#admin-chapters-list > div');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // If currently on Quotes tab
    if (!document.getElementById('tab-quotes').classList.contains('hidden')) {
      const quoteCards = document.querySelectorAll('#admin-quotes-list > div');
      quoteCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // If currently on Philosophers tab
    if (!document.getElementById('tab-philosophers')?.classList.contains('hidden')) {
      const philCards = document.querySelectorAll('#philosophers-cards-view > div');
      philCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // If currently on AI tab
    if (!document.getElementById('tab-ai')?.classList.contains('hidden')) {
      const aiItems = document.querySelectorAll('#admin-ai-stream-list > div');
      aiItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // If currently on Audio tab
    if (!document.getElementById('tab-audio')?.classList.contains('hidden')) {
      const audioRows = document.querySelectorAll('#admin-audio-books-list > div');
      audioRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    }
  });
}

/**
 * =========================================================================
 * PHÂN HỆ QUẢN LÝ NGƯỜI DÙNG, VAI TRÒ & NHẬT KÝ
 * =========================================================================
 */
let currentUserId = null;
let currentRoleId = null;
let allRolesCache = [];
let allPermissionsCache = [];

async function loadUsers(page = 1) {
  const tbody = document.getElementById('users-table-body');
  const search = document.getElementById('users-search-input')?.value || '';
  const status = document.getElementById('users-status-filter')?.value || 'all';
  
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i data-lucide="loader" class="w-5 h-5 mx-auto animate-spin text-amber-500"></i></td></tr>';
  if (window.lucide) window.lucide.createIcons();

  try {
    let url = `/api/users?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status !== 'all') url += `&status=${status}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    
    // Ensure we handle both structure formats depending on the API
    const users = Array.isArray(data) ? data : (data.users || []);
    
    if (users.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-xs text-stone-500">Không tìm thấy người dùng nào.</td></tr>';
      return;
    }

    if (tbody) {
      tbody.innerHTML = users.map(u => {
        const avatar = u.avatar_url || 'assets/avatars/default.svg';
        const roleStr = u.roles ? u.roles.map(r => r.name || r).join(', ') : 'Thành viên';
        let statusClass = 'bg-stone-100 text-stone-600';
        if (u.status === 'ACTIVE') statusClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200';
        if (u.status === 'BANNED') statusClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200';
        
        return `
          <tr class="hover:bg-stone-50 dark:hover:bg-emerald-900/20 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img src="${avatar}" class="w-8 h-8 rounded-full border border-stone-200 dark:border-emerald-800 object-cover">
                <div>
                  <div class="font-bold text-stone-900 dark:text-stone-100">${u.full_name || u.name || 'Unknown'}</div>
                  <div class="text-[10px] text-stone-500">${u.email}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded border text-[10px] font-bold ${statusClass}">${u.status || 'ACTIVE'}</span>
            </td>
            <td class="px-4 py-3">
              <span class="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">${roleStr}</span>
            </td>
            <td class="px-4 py-3 font-mono text-[11px]">
              LV ${u.level || 1} <span class="text-stone-400">(${u.xp || 0} XP)</span>
            </td>
            <td class="px-4 py-3 text-[10px] text-stone-500">
              ${u.last_login_at ? new Date(u.last_login_at).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button onclick="openAssignRoleModal('${u.id}')" class="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-stone-200 dark:hover:bg-emerald-900 transition-colors" title="Phân vai trò">
                  <i data-lucide="shield" class="w-4 h-4"></i>
                </button>
                <button onclick="openEditUserStatusModal('${u.id}', '${u.status || 'ACTIVE'}')" class="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 hover:bg-stone-200 dark:hover:bg-emerald-900 transition-colors" title="Đổi trạng thái">
                  <i data-lucide="activity" class="w-4 h-4"></i>
                </button>
                <button onclick="forceRevokeSessions('${u.id}')" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Đăng xuất cưỡng bức">
                  <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
    
    // Pagination (simple implementation for now)
    const pagination = document.getElementById('users-pagination');
    if (pagination && data.totalPages) {
      pagination.innerHTML = `
        <span>Trang ${data.currentPage} / ${data.totalPages}</span>
        <div class="flex gap-2">
          <button ${data.currentPage <= 1 ? 'disabled' : ''} onclick="loadUsers(${data.currentPage - 1})" class="px-3 py-1 bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 rounded-lg disabled:opacity-50">Trước</button>
          <button ${data.currentPage >= data.totalPages ? 'disabled' : ''} onclick="loadUsers(${data.currentPage + 1})" class="px-3 py-1 bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 rounded-lg disabled:opacity-50">Sau</button>
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error(err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-xs text-rose-500">Lỗi khi tải danh sách người dùng.</td></tr>';
  }
}

async function openAssignRoleModal(userId) {
  currentUserId = userId;
  document.getElementById('assign-role-user-id').value = userId;
  
  const container = document.getElementById('assign-role-list');
  container.innerHTML = '<div class="text-center"><i data-lucide="loader" class="w-4 h-4 mx-auto animate-spin"></i></div>';
  if (window.lucide) window.lucide.createIcons();
  
  openModal('modal-assign-role');

  try {
    const rolesRes = await fetch('/api/roles');
    if (rolesRes.ok) allRolesCache = await rolesRes.json();
    
    const userRolesRes = await fetch(`/api/users/${userId}`);
    let userRoles = [];
    if (userRolesRes.ok) {
      const u = await userRolesRes.json();
      userRoles = (u.roles || []).map(r => r.id || r.role_id || r);
    }
    
    container.innerHTML = allRolesCache.map(role => `
      <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-emerald-900 cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-emerald-800">
        <input type="checkbox" name="user_role" value="${role.id}" ${userRoles.includes(role.id) ? 'checked' : ''} class="w-4 h-4 accent-amber-500 bg-stone-100 border-stone-300 rounded focus:ring-amber-500">
        <div>
          <div class="font-bold text-stone-900 dark:text-stone-100">${role.name}</div>
          <div class="text-[10px] text-stone-500 font-mono">${role.key}</div>
        </div>
      </label>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-rose-500 text-xs">Lỗi khi tải dữ liệu vai trò.</p>';
  }
}

async function saveUserRoles(e) {
  e.preventDefault();
  const userId = document.getElementById('assign-role-user-id').value;
  const checkboxes = document.querySelectorAll('input[name="user_role"]:checked');
  const roleIds = Array.from(checkboxes).map(cb => cb.value);

  try {
    const res = await fetch(`/api/users/${userId}/roles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds })
    });
    
    if (res.ok) {
      showToast('Đã cập nhật vai trò người dùng thành công');
      closeModal('modal-assign-role');
      loadUsers();
    } else {
      showToast('Lỗi cập nhật vai trò', true);
    }
  } catch (err) {
    showToast('Lỗi kết nối', true);
  }
}

function openEditUserStatusModal(userId, currentStatus) {
  document.getElementById('edit-user-status-id').value = userId;
  document.getElementById('edit-user-status-select').value = currentStatus;
  openModal('modal-edit-user-status');
}

async function submitUserStatusChange(e) {
  e.preventDefault();
  const userId = document.getElementById('edit-user-status-id').value;
  const status = document.getElementById('edit-user-status-select').value;
  
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (res.ok) {
      showToast('Đã đổi trạng thái người dùng');
      closeModal('modal-edit-user-status');
      loadUsers();
    } else {
      showToast('Lỗi cập nhật trạng thái', true);
    }
  } catch (err) {
    showToast('Lỗi kết nối', true);
  }
}

async function forceRevokeSessions(userId) {
  if (!confirm('Bạn có chắc chắn muốn buộc người dùng này đăng xuất khỏi tất cả thiết bị?')) return;
  
  try {
    const res = await fetch(`/api/users/${userId}/revoke-sessions`, { method: 'POST' });
    if (res.ok) {
      showToast('Đã đăng xuất cưỡng bức người dùng');
    } else {
      showToast('Không thể đăng xuất người dùng', true);
    }
  } catch (err) {
    showToast('Lỗi kết nối', true);
  }
}

async function loadRoles() {
  const listContainer = document.getElementById('roles-list-container');
  if (listContainer) listContainer.innerHTML = '<div class="text-center"><i data-lucide="loader" class="w-5 h-5 mx-auto animate-spin"></i></div>';
  if (window.lucide) window.lucide.createIcons();

  try {
    const [rolesRes, permsRes] = await Promise.all([
      fetch('/api/roles'),
      fetch('/api/roles/permissions')
    ]);
    
    if (rolesRes.ok) allRolesCache = await rolesRes.json();
    if (permsRes.ok) allPermissionsCache = await permsRes.json();
    
    // Render Roles List
    if (listContainer) {
      listContainer.innerHTML = allRolesCache.map(r => `
        <button onclick="selectRoleToEdit('${r.id}')" class="w-full text-left p-3 rounded-2xl bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 hover:border-amber-500 transition-colors">
          <div class="font-bold text-stone-900 dark:text-stone-100">${r.name}</div>
          <div class="text-[10px] text-stone-500 font-mono">${r.key}</div>
        </button>
      `).join('');
    }
    
    // Auto select first role if available
    if (allRolesCache.length > 0) {
      selectRoleToEdit(allRolesCache[0].id);
    }
  } catch (err) {
    if (listContainer) listContainer.innerHTML = '<p class="text-rose-500">Lỗi tải dữ liệu.</p>';
  }
}

async function selectRoleToEdit(roleId) {
  currentRoleId = roleId;
  const matrix = document.getElementById('permissions-matrix-container');
  if (matrix) matrix.innerHTML = '<div class="text-center"><i data-lucide="loader" class="w-5 h-5 mx-auto animate-spin"></i></div>';
  if (window.lucide) window.lucide.createIcons();
  
  try {
    const res = await fetch(`/api/roles/${roleId}`);
    let rolePerms = [];
    if (res.ok) {
      const roleData = await res.json();
      rolePerms = (roleData.permissions || []).map(p => p.id || p.permission_id || p);
    }
    
    // Group permissions by category/resource
    const groups = {};
    allPermissionsCache.forEach(p => {
      const cat = p.resource || p.category || 'Hệ thống';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    
    let html = '';
    for (const cat in groups) {
      html += `
        <div class="mb-4">
          <h4 class="font-bold text-xs uppercase tracking-wider text-amber-600 mb-2 border-b border-stone-100 dark:border-emerald-900/60 pb-1">${cat}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            ${groups[cat].map(p => `
              <label class="flex items-start gap-2 p-2 rounded hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer">
                <input type="checkbox" name="role_permission" value="${p.id}" ${rolePerms.includes(p.id) ? 'checked' : ''} class="mt-0.5 accent-emerald-500">
                <div>
                  <div class="font-semibold text-stone-800 dark:text-stone-200 text-xs">${p.name || p.action}</div>
                  ${p.description ? `<div class="text-[9px] text-stone-500">${p.description}</div>` : ''}
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }
    if (matrix) matrix.innerHTML = html;
    
  } catch (err) {
    if (matrix) matrix.innerHTML = '<p class="text-rose-500">Lỗi nạp phân quyền.</p>';
  }
}

async function saveRolePermissions() {
  if (!currentRoleId) return;
  const checkboxes = document.querySelectorAll('input[name="role_permission"]:checked');
  const permissionIds = Array.from(checkboxes).map(cb => cb.value);
  
  try {
    const res = await fetch(`/api/roles/${currentRoleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionIds })
    });
    
    if (res.ok) {
      showToast('Lưu phân quyền thành công');
    } else {
      showToast('Lỗi lưu phân quyền', true);
    }
  } catch (err) {
    showToast('Lỗi kết nối', true);
  }
}

function openNewRoleModal() {
  document.getElementById('new-role-name').value = '';
  document.getElementById('new-role-key').value = '';
  document.getElementById('new-role-desc').value = '';
  openModal('modal-new-role');
}

async function submitNewRole(e) {
  e.preventDefault();
  const name = document.getElementById('new-role-name').value;
  const key = document.getElementById('new-role-key').value.toUpperCase();
  const description = document.getElementById('new-role-desc').value;
  
  try {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, key, description })
    });
    
    if (res.ok) {
      showToast('Tạo vai trò thành công');
      closeModal('modal-new-role');
      loadRoles();
    } else {
      showToast('Lỗi tạo vai trò', true);
    }
  } catch (err) {
    showToast('Lỗi kết nối', true);
  }
}

async function loadAuditLogs(page = 1) {
  const tbody = document.getElementById('audit-table-body');
  const action = document.getElementById('audit-action-filter')?.value || 'all';
  
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i data-lucide="loader" class="w-5 h-5 mx-auto animate-spin"></i></td></tr>';
  if (window.lucide) window.lucide.createIcons();

  try {
    let url = `/api/audit-logs?page=${page}&limit=15`;
    if (action !== 'all') url += `&action=${action}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    
    const logs = Array.isArray(data) ? data : (data.logs || []);
    
    if (logs.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-xs text-stone-500">Chưa có nhật ký hoạt động.</td></tr>';
      return;
    }
    
    if (tbody) {
      tbody.innerHTML = logs.map(log => {
        let actionColor = 'bg-stone-100 text-stone-600';
        if (log.action === 'CREATE') actionColor = 'bg-emerald-100 text-emerald-700';
        if (log.action === 'UPDATE') actionColor = 'bg-blue-100 text-blue-700';
        if (log.action === 'DELETE') actionColor = 'bg-rose-100 text-rose-700';
        
        return `
          <tr class="hover:bg-stone-50 dark:hover:bg-emerald-900/20 transition-colors">
            <td class="px-4 py-3 text-[10px] text-stone-500 font-mono">
              ${new Date(log.created_at || Date.now()).toLocaleString('vi-VN')}
            </td>
            <td class="px-4 py-3">
              <div class="font-bold text-stone-900 dark:text-stone-100">${log.user_email || log.user_name || log.user_id || 'System'}</div>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${actionColor}">${log.action}</span>
            </td>
            <td class="px-4 py-3 font-mono text-[10px]">
              <span class="text-amber-600">${log.resource_type || log.target_type || ''}</span>
              ${log.resource_id ? `<br><span class="text-stone-400">#${log.resource_id}</span>` : ''}
            </td>
            <td class="px-4 py-3 text-[10px] text-stone-500 max-w-xs truncate" title='${JSON.stringify(log.details || {})}'>
              ${log.details ? JSON.stringify(log.details) : 'Không có chi tiết'}
            </td>
          </tr>
        `;
      }).join('');
    }
    
    // Pagination
    const pagination = document.getElementById('audit-pagination');
    if (pagination && data.totalPages) {
      pagination.innerHTML = `
        <span>Trang ${data.currentPage} / ${data.totalPages}</span>
        <div class="flex gap-2">
          <button ${data.currentPage <= 1 ? 'disabled' : ''} onclick="loadAuditLogs(${data.currentPage - 1})" class="px-3 py-1 bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 rounded-lg disabled:opacity-50">Trước</button>
          <button ${data.currentPage >= data.totalPages ? 'disabled' : ''} onclick="loadAuditLogs(${data.currentPage + 1})" class="px-3 py-1 bg-white dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800 rounded-lg disabled:opacity-50">Sau</button>
        </div>
      `;
    }

  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-rose-500">Lỗi tải nhật ký.</td></tr>';
  }
}
