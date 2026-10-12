/**
 * SOPHIA CODEX - CẤU HÌNH THANH TOÁN VÀ XÁC THỰC BẢO MẬT
 * Thông tin ngân hàng, VietQR và chính sách bảo vệ khách hàng
 */

const PAYMENT_CONFIG = {
  // Thông tin thụ hưởng chính thức của Sophia Codex
  bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
  bankShortName: 'MB Bank',
  bankCode: 'MB', // Mã VietQR chuẩn Napas 247
  accountNumber: '0388688999',
  accountHolder: 'VU SI TIEN',
  
  // Thông tin ví điện tử MoMo
  momoPhone: '0388688999',
  momoHolder: 'VU SI TIEN',

  // Kênh liên hệ hỗ trợ & xác thực khách hàng
  supportPhone: '0388.688.999',
  supportZalo: 'https://zalo.me/0388688999',
  supportEmail: 'support@vusitien.click',

  // Danh mục gói dịch vụ chính thức
  plans: {
    PREMIUM_1M: {
      code: 'PREMIUM_1M',
      name: 'Sophia Premium - Gói Tháng',
      priceVnd: 49000,
      formattedPrice: '49.000đ',
      durationDays: 30,
      description: 'Mở khóa 100% sách toàn văn, Audio Studio & Socrates AI trong 30 ngày',
      dailyAiQuota: 100
    },
    PREMIUM_1Y: {
      code: 'PREMIUM_1Y',
      name: 'Sophia Premium - Gói Năm (Tiết kiệm 32%)',
      priceVnd: 399000,
      formattedPrice: '399.000đ',
      durationDays: 365,
      description: 'Mở khóa 100% toàn văn, Audio Studio & Socrates AI trong 365 ngày',
      dailyAiQuota: 100
    }
  },

  // Cam kết bảo vệ quyền lợi khách hàng (Anti-Loss Protection)
  guarantees: [
    'Bảo mật dữ liệu cá nhân theo tiêu chuẩn SSL/TLS cao nhất',
    'Không bao giờ tự động trừ tiền âm thầm khi hết hạn gói',
    'Biên nhận điện tử có giá trị tra cứu và bảo hành vĩnh viễn',
    'Cam kết hoàn tiền 100% trong 7 ngày nếu dịch vụ phát sinh lỗi kỹ thuật',
    'Đội ngũ chăm sóc và quản trị viên trực tiếp hỗ trợ 24/7 qua Hotline/Zalo'
  ]
};

/**
 * Tạo link VietQR chuẩn NAPAS tự động
 * @param {string} orderCode Mã đơn hàng duy nhất
 * @param {number} amountVnd Số tiền VNĐ
 */
function generateVietQrUrl(orderCode, amountVnd) {
  const account = PAYMENT_CONFIG.accountNumber;
  const bank = PAYMENT_CONFIG.bankCode;
  const memo = encodeURIComponent(orderCode);
  const name = encodeURIComponent(PAYMENT_CONFIG.accountHolder);
  return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amountVnd}&addInfo=${memo}&accountName=${name}`;
}

module.exports = {
  PAYMENT_CONFIG,
  generateVietQrUrl
};
