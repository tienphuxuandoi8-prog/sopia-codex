const { randomToken, timingSafeCompare } = require('../lib/crypto');

/**
 * Route handler tạo và trả về CSRF token.
 * Token được thiết lập vào cookie và trả về JSON.
 */
function csrfToken(req, res) {
  const token = randomToken(32);
  
  // Cài đặt cookie: không dùng HttpOnly để JS frontend có thể đọc được token (nếu cần), 
  // hoặc thiết lập để frontend phải parse JSON response. SameSite Lax bảo vệ cơ bản.
  res.cookie('csrf', token, {
    httpOnly: false, 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  res.json({ csrfToken: token });
}

/**
 * Middleware bảo vệ CSRF sử dụng Double-Submit Cookie pattern.
 */
function csrfProtection(req, res, next) {
  // Bỏ qua kiểm tra với các method an toàn
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bỏ qua với đường dẫn IPN từ cổng thanh toán (VNPay, MoMo)
  const fullUrl = req.originalUrl || req.url || '';
  if (fullUrl.includes('/payments/') && fullUrl.endsWith('/ipn')) {
    return next();
  }

  const cookieToken = req.cookies?.csrf;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      error: { code: 'CSRF_FAILED', message: 'Thiếu CSRF token' }
    });
  }

  // So sánh token an toàn để chống timing attack
  if (!timingSafeCompare(cookieToken, headerToken)) {
    return res.status(403).json({
      error: { code: 'CSRF_FAILED', message: 'CSRF token không hợp lệ' }
    });
  }

  next();
}

module.exports = {
  csrfProtection,
  csrfToken
};
