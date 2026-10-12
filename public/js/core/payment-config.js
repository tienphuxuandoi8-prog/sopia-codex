/**
 * SOPHIA CODEX - CLIENT PAYMENT & VERIFICATION CONFIGURATION
 * Hệ thống thông tin thanh toán minh bạch, bảo vệ quyền lợi người mua
 */

window.SOPHIA_PAYMENT = (() => {
  const CONFIG = {
    bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
    bankShortName: 'MB Bank',
    bankCode: 'MB',
    accountNumber: '0388688999',
    accountHolder: 'VU SI TIEN',
    momoPhone: '0388688999',
    momoHolder: 'VU SI TIEN',
    supportPhone: '0388.688.999',
    supportZalo: 'https://zalo.me/0388688999',
    supportEmail: 'support@vusitien.click',

    plans: {
      month: {
        code: 'PREMIUM_1M',
        name: 'Sophia Premium - Gói Tháng',
        priceVnd: 49000,
        formattedPrice: '49.000đ',
        durationDays: 30,
        description: 'Mở khóa 100% sách toàn văn, Audio Studio & Socrates AI trong 30 ngày',
        tag: 'Phổ biến'
      },
      year: {
        code: 'PREMIUM_1Y',
        name: 'Sophia Premium - Gói Năm (Tiết kiệm 32%)',
        priceVnd: 399000,
        formattedPrice: '399.000đ',
        durationDays: 365,
        description: 'Mở khóa 100% toàn văn, Audio Studio & Socrates AI trong 365 ngày (~33.000đ/tháng)',
        tag: 'Tiết kiệm nhất'
      }
    },

    benefits: [
      '100% Toàn văn các kiệt tác triết học kinh điển (Đạo Đức Kinh, Suy Tưởng, Cộng Hòa, Zarathustra...)',
      '100 câu đàm đạo thông tuệ mỗi ngày với Hiền Triết Socrates AI',
      'Kho sách nói Studio Audio chuẩn phòng thu & nhạc thiền định sóng não',
      'Sổ tay trích dẫn danh ngôn cá nhân, xuất file Markdown không giới hạn',
      'Không gian đọc thuần khiết, thanh tịnh tuyệt đối không quảng cáo'
    ],

    guarantees: [
      '🛡️ Cam kết kích hoạt nhanh chóng trong 5 - 10 phút sau khi đối soát',
      '💯 Hoàn tiền 100% không phiền hà nếu hệ thống gặp lỗi kỹ thuật hoặc quý khách chuyển nhầm',
      '🔒 Tuyệt đối không tự động trừ tiền âm thầm khi hết hạn gói',
      '📞 Có chuyên viên và tác giả trực tiếp hỗ trợ 24/7 qua Hotline/Zalo'
    ]
  };

  /**
   * Tạo link VietQR chuẩn NAPAS 247
   */
  function getVietQrUrl(orderCode, amountVnd) {
    const memo = encodeURIComponent(orderCode);
    const name = encodeURIComponent(CONFIG.accountHolder);
    return `https://img.vietqr.io/image/${CONFIG.bankCode}-${CONFIG.accountNumber}-compact2.png?amount=${amountVnd}&addInfo=${memo}&accountName=${name}`;
  }

  /**
   * Sinh mã đơn hàng chuẩn hoá duy nhất
   */
  function generateOrderCode() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SC-${yy}${mm}${dd}-${rand}`;
  }

  /**
   * Sao chép nội dung vào Clipboard có thông báo
   */
  async function copyToClipboard(text, successMessage = 'Đã sao chép vào bộ nhớ tạm!') {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      if (window.API && window.API.success) {
        window.API.success(successMessage);
      } else {
        alert('✓ ' + successMessage);
      }
      return true;
    } catch (e) {
      console.warn('Lỗi sao chép:', e);
      return false;
    }
  }

  /**
   * Lưu trữ đơn hàng của độc giả trên trình duyệt
   */
  function saveLocalOrder(order) {
    try {
      const orders = JSON.parse(localStorage.getItem('sophia_orders') || '[]');
      const existingIdx = orders.findIndex(o => o.orderCode === order.orderCode);
      if (existingIdx >= 0) {
        orders[existingIdx] = { ...orders[existingIdx], ...order };
      } else {
        orders.unshift(order);
      }
      localStorage.setItem('sophia_orders', JSON.stringify(orders.slice(0, 20)));
    } catch(e) {}
  }

  function getLocalOrders() {
    try {
      return JSON.parse(localStorage.getItem('sophia_orders') || '[]');
    } catch(e) {
      return [];
    }
  }

  return {
    CONFIG,
    getVietQrUrl,
    generateOrderCode,
    copyToClipboard,
    saveLocalOrder,
    getLocalOrders
  };
})();
