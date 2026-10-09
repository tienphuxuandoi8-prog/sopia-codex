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
        // 401 hoặc lỗi mạng → chưa đăng nhập
        _user = null;
        _permissions = [];
        _isPremium = false;
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
      await API.post('/auth/logout');
    } catch (e) {
      // Bỏ qua lỗi, vẫn xóa state phía client
    }
    _user = null;
    _permissions = [];
    _isPremium = false;
    window.location.href = '/';
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

// Tự động tải khi trang load
document.addEventListener('DOMContentLoaded', () => Auth.loadMe());
