const express = require('express');
const { requireAuth } = require('../../middleware/requireAuth');
const gamificationService = require('./service');

const router = express.Router();

/**
 * GET /badges
 * Lấy danh sách huy hiệu của người dùng hiện tại
 */
router.get('/badges', requireAuth, async (req, res, next) => {
  try {
    const badges = await gamificationService.getUserBadges(req.user.id);
    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /check-badges
 * Kiểm tra và trao huy hiệu (nếu đạt)
 */
router.post('/check-badges', requireAuth, async (req, res, next) => {
  try {
    const result = await gamificationService.checkAndAwardBadges(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /leaderboard
 * Lấy bảng xếp hạng
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await gamificationService.getLeaderboard({ limit });
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /levels
 * Lấy danh sách thông tin cấp độ và số XP yêu cầu
 */
router.get('/levels', (req, res) => {
  res.json({ success: true, data: gamificationService.XP_LEVEL_THRESHOLDS });
});

module.exports = router;
