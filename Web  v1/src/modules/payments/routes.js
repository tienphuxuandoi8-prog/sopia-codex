const express = require('express');
const { requireAuth } = require('../../middleware/requireAuth');
const service = require('./service');

const router = express.Router();

/**
 * Lấy danh sách gói cước
 */
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await service.getPlans();
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

/**
 * Tạo đơn thanh toán
 */
router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const { planCode, provider } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const result = await service.createCheckout(req.user.id, { planCode, provider, ip });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * Trạng thái đơn hàng
 */
router.get('/orders/:code/status', requireAuth, async (req, res, next) => {
  try {
    const status = await service.getOrderStatus(req.params.code);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

/**
 * VNPay Return URL
 */
router.get('/vnpay/return', (req, res) => {
  const txnRef = req.query.vnp_TxnRef;
  res.redirect(`/payment-result.html?code=${txnRef}&provider=VNPAY`);
});

/**
 * VNPay IPN Handler
 */
router.get('/vnpay/ipn', async (req, res, next) => {
  try {
    const result = await service.handleVnpayIpn(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * MoMo Return URL
 */
router.get('/momo/return', (req, res) => {
  const orderId = req.query.orderId;
  res.redirect(`/payment-result.html?code=${orderId}&provider=MOMO`);
});

/**
 * MoMo IPN Handler
 */
router.post('/momo/ipn', express.json(), async (req, res, next) => {
  try {
    const result = await service.handleMomoIpn(req.body);
    res.status(result.statusCode || 200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
