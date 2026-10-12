const express = require('express');
const service = require('./service');

const router = express.Router();

/**
 * Lấy danh sách gói cước
 */
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await service.getPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

/**
 * Tạo đơn thanh toán (Hỗ trợ cả người dùng đã đăng nhập hoặc khách mua)
 */
router.post('/checkout', async (req, res, next) => {
  try {
    const { planCode, provider, customerEmail, customerName, customerPhone } = req.body;
    const userId = req.user ? req.user.id : null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const result = await service.createCheckout(userId, {
      planCode,
      provider,
      ip,
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      customerName: customerName || (req.user ? req.user.displayName : ''),
      customerPhone: customerPhone || ''
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Xác thực giao dịch chuyển khoản từ khách hàng
 */
router.post('/orders/:code/verify', async (req, res, next) => {
  try {
    const { transactionRef, customerPhone, senderNote } = req.body;
    const result = await service.verifyTransfer({
      orderCode: req.params.code,
      transactionRef,
      customerPhone,
      senderNote
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Trạng thái đơn hàng
 */
router.get('/orders/:code/status', async (req, res, next) => {
  try {
    const status = await service.getOrderStatus(req.params.code);
    res.json({ success: true, data: status });
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
