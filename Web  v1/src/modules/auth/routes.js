const express = require('express');
const crypto = require('crypto');
const validate = require('../../middleware/validate');
const requireAuth = require('../../middleware/requireAuth');
const schemas = require('./schema');
const authService = require('./service');

const router = express.Router();

// Đăng ký
router.post('/register', validate(schemas.registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Xác thực email
router.post('/verify-email', validate(schemas.verifyEmailSchema), async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Gửi lại email xác thực
router.post('/resend-verification', requireAuth, validate(schemas.resendVerificationSchema), async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Đăng nhập
router.post('/login', validate(schemas.loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || '';

    const { user, sessionToken, expiresAt } = await authService.login({ email, password, ip, userAgent });

    // Set cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Host-sid' : 'sid';
    
    res.cookie(cookieName, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    // Tạo CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      secure: isProd,
      sameSite: 'lax',
      path: '/'
    });

    const userInfo = await authService.getMe({ id: user.id });
    
    res.json({
      success: true,
      user: userInfo.user,
      csrfToken
    });
  } catch (error) {
    next(error);
  }
});

// Đăng xuất
router.post('/logout', async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Host-sid' : 'sid';
    const sessionToken = req.cookies[cookieName];

    await authService.logout(sessionToken);

    res.clearCookie(cookieName, { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });
    
    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error) {
    next(error);
  }
});

// Đăng xuất tất cả thiết bị
router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
    
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Host-sid' : 'sid';
    
    res.clearCookie(cookieName, { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });

    res.json({ success: true, message: 'Đã đăng xuất khỏi tất cả thiết bị' });
  } catch (error) {
    next(error);
  }
});

// Quên mật khẩu
router.post('/forgot-password', validate(schemas.forgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Đặt lại mật khẩu
router.post('/reset-password', validate(schemas.resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Lấy thông tin auth hiện tại
router.get('/me', async (req, res, next) => {
  try {
    // req.user có thể null nếu không có middleware requireAuth nhưng có authMiddleware phân tích token
    const result = await authService.getMe(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
