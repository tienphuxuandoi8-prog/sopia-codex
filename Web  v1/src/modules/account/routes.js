const express = require('express');
const validate = require('../../middleware/validate');
const requireAuth = require('../../middleware/requireAuth');
const schemas = require('./schema');
const accountService = require('./service');

const router = express.Router();

// Tất cả các route đều yêu cầu xác thực
router.use(requireAuth);

// Lấy thông tin profile
router.get('/profile', async (req, res, next) => {
  try {
    const profile = await accountService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Cập nhật profile
router.patch('/profile', validate(schemas.updateProfileSchema), async (req, res, next) => {
  try {
    const updatedProfile = await accountService.updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

// Thay đổi mật khẩu
router.post('/change-password', validate(schemas.changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await accountService.changePassword(req.user.id, currentPassword, newPassword);
    
    // Clear cookies as all sessions are revoked
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Host-sid' : 'sid';
    res.clearCookie(cookieName, { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Lấy danh sách session
router.get('/sessions', async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Host-sid' : 'sid';
    const currentSessionToken = req.cookies[cookieName];

    const sessions = await accountService.getSessions(req.user.id, currentSessionToken);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// Thu hồi session
router.delete('/sessions/:id', async (req, res, next) => {
  try {
    const result = await accountService.revokeSession(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Xóa tài khoản
router.delete('/', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu để xác nhận' });
    }

    const result = await accountService.deleteAccount(req.user.id, password);
    
    // Clear cookies
    const isProd = process.env.NODE_ENV === 'production';
    const cookieName = isProd ? '__Host-sid' : 'sid';
    res.clearCookie(cookieName, { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
