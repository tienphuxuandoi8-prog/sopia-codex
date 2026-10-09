/**
 * SOPHIA CODEX - DOM UTILITIES
 * Hàm tiện ích DOM an toàn: escape HTML, render template, event delegation.
 */

const DOM = (() => {
  /**
   * Escape HTML để chống XSS - LUÔN dùng thay vì innerHTML với dữ liệu người dùng
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Tạo element từ HTML string (dùng cho template tĩnh, KHÔNG chứa dữ liệu user)
   */
  function createEl(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  /**
   * Đặt text an toàn cho element
   */
  function setText(el, text) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.textContent = text;
  }

  /**
   * Event delegation - gắn sự kiện 1 lần ở parent, xử lý theo data-action
   * @param {string|Element} parentSelector
   * @param {string} eventType
   * @param {object} handlers - { 'action-name': (event, target) => {} }
   *
   * Sử dụng: <button data-action="delete" data-id="123">Xóa</button>
   * DOM.delegate('#container', 'click', { delete: (e, el) => console.log(el.dataset.id) })
   */
  function delegate(parentSelector, eventType, handlers) {
    const parent = typeof parentSelector === 'string'
      ? document.querySelector(parentSelector)
      : parentSelector;

    if (!parent) return;

    parent.addEventListener(eventType, (e) => {
      const target = e.target.closest('[data-action]');
      if (!target || !parent.contains(target)) return;

      const action = target.dataset.action;
      if (handlers[action]) {
        e.preventDefault();
        handlers[action](e, target);
      }
    });
  }

  /**
   * Render danh sách vào container với template function
   * @param {string|Element} containerSelector
   * @param {Array} items
   * @param {function} templateFn - (item) => HTML string
   * @param {string} emptyMessage
   */
  function renderList(containerSelector, items, templateFn, emptyMessage = 'Không có dữ liệu') {
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;

    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-stone-500 dark:text-stone-400">
          <p class="text-sm">${escapeHtml(emptyMessage)}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(templateFn).join('');
  }

  /**
   * Hiển thị/ẩn loading spinner
   */
  function showLoading(containerSelector, show = true) {
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
    if (!container) return;

    if (show) {
      container.innerHTML = `
        <div class="flex justify-center items-center py-16">
          <div class="animate-spin w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full"></div>
        </div>
      `;
    }
  }

  /**
   * Format số hiển thị (1000 → 1K, 1000000 → 1M)
   */
  function formatNumber(num) {
    if (!num) return '0';
    num = Number(num);
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'K';
    return num.toString();
  }

  /**
   * Format thời gian tương đối (vừa xong, 5 phút trước, 2 ngày trước...)
   */
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  }

  return {
    escapeHtml,
    createEl,
    setText,
    delegate,
    renderList,
    showLoading,
    formatNumber,
    timeAgo,
  };
})();
