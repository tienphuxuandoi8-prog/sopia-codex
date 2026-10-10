/**
 * Middleware yêu cầu người dùng phải đăng nhập.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Yêu cầu đăng nhập'
      }
    });
  }
  next();
}

/**
 * Middleware yêu cầu người dùng đã xác minh email (trạng thái ACTIVE).
 */
function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Yêu cầu đăng nhập'
      }
    });
  }
  
  if (req.user.status === 'PENDING') {
    return res.status(403).json({
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Vui lòng xác minh email để thực hiện hành động này'
      }
    });
  }
  
  if (req.user.status !== 'ACTIVE') {
    return res.status(403).json({
      error: {
        code: 'ACCOUNT_INACTIVE',
        message: 'Tài khoản không hoạt động'
      }
    });
  }
  
  next();
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireVerified = requireVerified;
