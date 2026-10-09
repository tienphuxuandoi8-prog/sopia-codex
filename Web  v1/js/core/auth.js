/**
 * SOPHIA CODEX - AUTH STATE MANAGER
 * Quản lý trạng thái đăng nhập, quyền hạn, Premium trên frontend.
 * Gọi /api/v1/auth/me khi load trang để lấy thông tin người dùng.
 */

const Auth = (() => {
  let _user = null;        // null = chưa tải hoặc chưa đăng nhập
  let _permissions = [];   // Mảng permission key
  let _isPremium = false;
  let _premiumUntil = null;
  let _aiQuota = null;
  let _loaded = false;
  let _loadPromise = null;

  /**
   * Tải thông tin người dùng từ server (gọi 1 lần khi load trang)
   */
  async function loadMe() {
    if (_loadPromise) return _loadPromise;

    _loadPromise = (async () => {
      try {
        const data = await API.get('/auth/me');
        _user = data.user || null;
        _permissions = data.permissions || [];
        _isPremium = data.isPremium || false;
        _premiumUntil = data.premiumUntil || null;
        _aiQuota = data.aiQuota || null;
      } catch (err) {
        // Fallback đọc user từ localStorage (hỗ trợ chế độ ngoại tuyến / file mode)
        const localUser = localStorage.getItem('sophia_user');
        if (localUser) {
          try {
            _user = JSON.parse(localUser);
            _permissions = _user.permissions || (_user.isSuperAdmin ? ['*'] : []);
            _isPremium = true;
          } catch(e) {
            _user = null;
            _permissions = [];
            _isPremium = false;
          }
        } else {
          _user = null;
          _permissions = [];
          _isPremium = false;
        }
      }
      _loaded = true;
      _updateUI();
      return _user;
    })();

    return _loadPromise;
  }

  /** Người dùng đã đăng nhập? */
  function isLoggedIn() {
    return _user !== null;
  }

  /** Kiểm tra quyền (admin/editor) */
  function can(permissionKey) {
    if (!_user) return false;
    // Super Admin có mọi quyền
    if (_permissions.includes('*')) return true;
    return _permissions.includes(permissionKey);
  }

  /** Có bất kỳ quyền quản trị nào? */
  function hasAnyAdminPermission() {
    if (!_user) return false;
    if (_permissions.includes('*')) return true;
    return _permissions.length > 0;
  }

  /** Là hội viên Premium? */
  function isPremium() {
    return _isPremium;
  }

  /** Lấy thông tin user */
  function getUser() {
    return _user;
  }

  /** Lấy quota AI */
  function getAiQuota() {
    return _aiQuota;
  }

  /**
   * Cập nhật giao diện theo trạng thái đăng nhập
   */
  function _updateUI() {
    // Ẩn/hiện các phần tử theo trạng thái
    document.querySelectorAll('[data-auth="logged-in"]').forEach(el => {
      el.classList.toggle('hidden', !isLoggedIn());
    });
    document.querySelectorAll('[data-auth="logged-out"]').forEach(el => {
      el.classList.toggle('hidden', isLoggedIn());
    });
    document.querySelectorAll('[data-auth="premium"]').forEach(el => {
      el.classList.toggle('hidden', !_isPremium);
    });

    // Hiển thị tên + avatar nếu đã đăng nhập
    if (_user) {
      document.querySelectorAll('[data-auth-name]').forEach(el => {
        el.textContent = _user.displayName || _user.email.split('@')[0];
      });
      document.querySelectorAll('[data-auth-email]').forEach(el => {
        el.textContent = _user.email;
      });
      document.querySelectorAll('[data-auth-avatar]').forEach(el => {
        if (_user.avatarUrl) {
          el.src = _user.avatarUrl;
        }
      });
      document.querySelectorAll('[data-auth-level]').forEach(el => {
        const levels = ['Sơ Học', 'Tầm Đạo', 'Chiêm Nghiệm', 'Minh Triết', 'Hiền Giả'];
        el.textContent = `Cấp ${_user.level}: ${levels[Math.min(_user.level - 1, levels.length - 1)] || 'Sơ Học'}`;
      });
      document.querySelectorAll('[data-auth-xp]').forEach(el => {
        el.textContent = `${_user.xp} XP`;
      });

      // Ẩn/hiện link admin
      document.querySelectorAll('[data-auth="admin"]').forEach(el => {
        el.classList.toggle('hidden', !hasAnyAdminPermission());
      });

      // Banner xác thực email
      if (_user.status === 'PENDING') {
        _showVerifyBanner();
      }
    }
  }

  function _showVerifyBanner() {
    const existing = document.getElementById('verify-email-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'verify-email-banner';
    banner.className = 'fixed top-0 inset-x-0 z-[9998] bg-amber-600 text-white text-center py-2 text-sm font-medium shadow-md';
    banner.innerHTML = `
      <span>📧 Vui lòng xác thực email để sử dụng đầy đủ tính năng.</span>
      <button onclick="Auth.resendVerification()" class="ml-2 underline hover:no-underline">Gửi lại email</button>
    `;
    document.body.prepend(banner);
  }

  /** Gửi lại email xác thực */
  async function resendVerification() {
    try {
      await API.post('/auth/resend-verification');
      Toast.success('Đã gửi lại email xác thực!');
    } catch (err) {
      Toast.error(err.message || 'Không thể gửi email');
    }
  }

  /** Đăng xuất */
  async function logout() {
    try {
      if (window.location.protocol.startsWith('http') && typeof API !== 'undefined') {
        await API.post('/auth/logout');
      }
    } catch (e) {
      // Bỏ qua lỗi, vẫn xóa state phía client
    }
    localStorage.removeItem('sophia_user');
    sessionStorage.removeItem('sophia_user');
    _user = null;
    _permissions = [];
    _isPremium = false;
    window.location.href = 'index.html';
  }

  return {
    loadMe,
    isLoggedIn,
    can,
    hasAnyAdminPermission,
    isPremium,
    getUser,
    getAiQuota,
    logout,
    resendVerification,
  };
})();

/**
 * SOPHIA CODEX - LOCAL AUTH STORE
 * Lưu trữ và xác thực tài khoản độc giả / admin bền vững trên client.
 * Đồng bộ hai tài khoản mặc định và mã hóa mật khẩu SHA-256.
 */
const AuthStore = (() => {
  const DB_KEY = 'sophia_accounts_db';

  const SEED_ACCOUNTS = [
    {
      id: 'usr_seed_admin',
      email: 'admin@sophiacodex.vn',
      passwordHash: '8430bd3e52374280cfacef6bc53c63c78d6f605b98bb4cd5cce8b41315d857ee', // Admin@Sophia2026!
      displayName: 'Quản Trị Viên',
      isSuperAdmin: true,
      permissions: ['*'],
      roles: ['admin'],
      level: 5,
      xp: 9999,
      createdAt: '2026-10-09T00:00:00.000Z'
    },
    {
      id: 'usr_demo_reader',
      email: 'docgia@sophiacodex.vn',
      passwordHash: '86faec2ad09e51f68e06bf29ca048dcbb12265cbda2587b6e135213f3dbe588a', // Docgia@Sophia2026!
      displayName: 'Độc Giả Triết Học',
      isSuperAdmin: false,
      permissions: ['reader.read'],
      roles: ['member'],
      level: 1,
      xp: 150,
      createdAt: '2026-10-09T00:00:00.000Z'
    }
  ];

  async function hashPassword(str) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        // fallback bên dưới nếu subtle bị chặn
      }
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }

  function getAccounts() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        localStorage.setItem(DB_KEY, JSON.stringify(SEED_ACCOUNTS));
        return [...SEED_ACCOUNTS];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(DB_KEY, JSON.stringify(SEED_ACCOUNTS));
        return [...SEED_ACCOUNTS];
      }
      return parsed;
    } catch (e) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_ACCOUNTS));
      return [...SEED_ACCOUNTS];
    }
  }

  function saveAccounts(accounts) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(accounts));
      return true;
    } catch (e) {
      return false;
    }
  }

  function findByEmail(email) {
    if (!email) return null;
    const norm = email.trim().toLowerCase();
    const list = getAccounts();
    return list.find(a => a.email.trim().toLowerCase() === norm) || null;
  }

  async function register({ email, password, displayName }) {
    if (!email || !password) {
      return { success: false, error: 'Email và mật khẩu không được để trống.' };
    }
    const norm = email.trim().toLowerCase();
    if (findByEmail(norm)) {
      return { success: false, error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.' };
    }

    const hash = await hashPassword(password);
    const isAdmin = norm === 'admin@sophiacodex.vn';
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      email: norm,
      passwordHash: hash,
      displayName: (displayName && displayName.trim()) || norm.split('@')[0],
      status: 'ACTIVE',
      isSuperAdmin: isAdmin,
      permissions: isAdmin ? ['*'] : ['reader.read'],
      roles: isAdmin ? ['admin'] : ['member'],
      level: isAdmin ? 5 : 1,
      xp: isAdmin ? 9999 : 100,
      createdAt: new Date().toISOString()
    };

    const accounts = getAccounts();
    accounts.push(newUser);
    saveAccounts(accounts);

    return { success: true, user: newUser };
  }

  async function verify({ email, password }) {
    if (!email || !password) {
      return { success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' };
    }
    const norm = email.trim().toLowerCase();
    const account = findByEmail(norm);
    if (!account) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.' };
    }

    const hash = await hashPassword(password);
    if (account.passwordHash !== hash) {
      return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
    }

    const userObj = {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      status: account.status || 'ACTIVE',
      isSuperAdmin: !!account.isSuperAdmin,
      permissions: account.permissions || (account.isSuperAdmin ? ['*'] : ['reader.read']),
      roles: account.roles || (account.isSuperAdmin ? ['admin'] : ['member']),
      level: account.level || 1,
      xp: account.xp || 100
    };

    localStorage.setItem('sophia_user', JSON.stringify(userObj));
    return { success: true, user: userObj };
  }

  return {
    getAccounts,
    findByEmail,
    register,
    verify,
    hashPassword
  };
})();

if (typeof window !== 'undefined') {
  window.Auth = Auth;
  window.AuthStore = AuthStore;
}

// Tự động tải khi trang load
document.addEventListener('DOMContentLoaded', () => Auth.loadMe());

