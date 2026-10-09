/**
 * SOPHIA CODEX - API CLIENT
 * Wrapper fetch xử lý: CSRF token, credentials, lỗi 401 redirect, toast thông báo.
 * Dùng cho toàn bộ frontend JS.
 */

const API = (() => {
  const BASE = '/api/v1';
  let _csrfToken = null;

  /**
   * Lấy CSRF token từ server (gọi 1 lần khi load trang)
   */
  async function _fetchCsrfToken() {
    try {
      const res = await fetch(`${BASE}/auth/csrf`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        _csrfToken = data.token || data.csrfToken;
      }
    } catch (e) {
      console.warn('[API] Could not fetch CSRF token:', e.message);
    }
  }

  /**
   * Gọi API với xử lý lỗi chuẩn
   * @param {string} path - Đường dẫn API (ví dụ: '/books')
   * @param {object} options - fetch options
   * @returns {Promise<any>} response JSON
   */
  async function request(path, options = {}) {
    const url = path.startsWith('http') ? path : `${BASE}${path}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Gắn CSRF token cho các request ghi
    const method = (options.method || 'GET').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && _csrfToken) {
      headers['X-CSRF-Token'] = _csrfToken;
    }

    const config = {
      ...options,
      method,
      headers,
      credentials: 'include', // Luôn gửi cookie
    };

    // Nếu body là object, chuyển thành JSON
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    // Nếu là FormData, xóa Content-Type để browser tự set boundary
    if (config.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const res = await fetch(url, config);

      // Parse JSON response
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = data.error || {};
        const isAuthRequest = path.includes('/auth/login') || path.includes('/auth/register');
        const isLoginPage = window.location.pathname.includes('login');

        // Chỉ chuyển sang trang login nếu 401 xảy ra ở trang khác và không phải request đăng nhập
        if (res.status === 401 && !isAuthRequest && !isLoginPage) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `login.html?next=${encodeURIComponent(currentPath)}`;
        }

        throw new ApiError(
          res.status,
          error.code || 'UNKNOWN',
          error.message || `Lỗi ${res.status}`
        );
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Network error
      throw new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối đến máy chủ');
    }
  }

  // Shorthand methods
  const get    = (path, query) => {
    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    return request(`${path}${qs}`);
  };
  const post   = (path, body) => request(path, { method: 'POST', body });
  const put    = (path, body) => request(path, { method: 'PUT', body });
  const patch  = (path, body) => request(path, { method: 'PATCH', body });
  const del    = (path) =>       request(path, { method: 'DELETE' });

  /**
   * Upload file (dùng FormData)
   */
  const upload = (path, formData) => request(path, {
    method: 'POST',
    body: formData,
  });

  // Khởi tạo CSRF token khi load
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', _fetchCsrfToken);
  }

  return { get, post, put, patch, del, upload, request };
})();


/**
 * Lớp lỗi API tùy chỉnh
 */
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}


/**
 * Hiển thị toast thông báo
 */
const Toast = (() => {
  let container = null;

  function _getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 4000) {
    const c = _getContainer();
    const toast = document.createElement('div');

    const colors = {
      success: 'bg-emerald-800 text-emerald-100 border-emerald-600',
      error:   'bg-red-900 text-red-100 border-red-600',
      warning: 'bg-amber-800 text-amber-100 border-amber-600',
      info:    'bg-stone-800 text-stone-100 border-stone-600',
    };

    const icons = {
      success: '✓',
      error:   '✕',
      warning: '⚠',
      info:    'ℹ',
    };

    toast.className = `pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-slide-up ${colors[type] || colors.info}`;
    toast.innerHTML = `<span class="text-base">${icons[type] || icons.info}</span><span>${_escapeHtml(message)}</span>`;

    c.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function _escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  return {
    success: (msg) => show(msg, 'success'),
    error:   (msg) => show(msg, 'error'),
    warning: (msg) => show(msg, 'warning'),
    info:    (msg) => show(msg, 'info'),
  };
})();
