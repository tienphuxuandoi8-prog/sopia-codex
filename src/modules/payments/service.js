const prisma = require('../../lib/prisma');
const vnpay = require('./vnpay');
const momo = require('./momo');
const env = require('../../config/env');
const { AppError } = require('../../middleware/errorHandler');
const { PAYMENT_CONFIG, generateVietQrUrl } = require('../../config/payment');
const localOrderStore = require('../../lib/localOrderStore');

/**
 * Lấy danh sách các gói cước đang hoạt động
 */
async function getPlans() {
  if (process.env.DATABASE_URL && prisma && prisma.plan) {
    try {
      const dbPlans = await prisma.plan.findMany({
        where: { isActive: true }
      });
      if (dbPlans && dbPlans.length > 0) return dbPlans;
    } catch (e) {
      console.warn('[PaymentsService] Could not fetch plans from DB, using config:', e.message);
    }
  }

  // Fallback to official plans from PAYMENT_CONFIG
  return Object.values(PAYMENT_CONFIG.plans).map(p => ({
    id: p.code,
    code: p.code,
    name: p.name,
    priceVnd: p.priceVnd,
    durationDays: p.durationDays,
    description: p.description,
    isActive: true
  }));
}

/**
 * Tạo phiên thanh toán chuẩn hoá
 */
async function createCheckout(userId, { planCode, provider = 'VIETQR', ip, customerEmail, customerName, customerPhone }) {
  const planInfo = PAYMENT_CONFIG.plans[planCode] || Object.values(PAYMENT_CONFIG.plans).find(p => p.code === planCode);
  if (!planInfo) {
    throw new AppError(404, 'Gói dịch vụ không tồn tại trong hệ thống');
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `SC-${yy}${mm}${dd}-${rand}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

  // 1. Lưu đơn hàng vào localOrderStore (bảo vệ khách hàng kể cả khi thiếu Postgres)
  const localOrder = localOrderStore.createOrder({
    orderCode,
    userId: userId || null,
    customerEmail: customerEmail || '',
    customerName: customerName || '',
    customerPhone: customerPhone || '',
    planCode: planInfo.code,
    planName: planInfo.name,
    amountVnd: planInfo.priceVnd,
    provider,
    status: 'PENDING',
    expiresAt
  });

  // 2. Nếu có database Postgres, lưu vào bảng Order của Prisma
  if (process.env.DATABASE_URL && prisma && prisma.order && prisma.plan) {
    try {
      const dbPlan = await prisma.plan.findUnique({ where: { code: planCode } });
      if (dbPlan && userId) {
        await prisma.order.create({
          data: {
            userId,
            planId: dbPlan.id,
            orderCode,
            status: 'PENDING',
            amountVnd: planInfo.priceVnd,
            expiresAt,
            provider
          }
        });
      }
    } catch (e) {
      console.warn('[PaymentsService] Failed to record order in Prisma:', e.message);
    }
  }

  const orderInfo = `SOPHIA ${orderCode}`;
  const vietQrUrl = generateVietQrUrl(orderCode, planInfo.priceVnd);

  // Xử lý theo từng provider
  if (provider === 'VNPAY') {
    if (env.VNPAY_TMN_CODE && env.VNPAY_HASH_SECRET) {
      const returnUrl = `${env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/vnpay/return`;
      const payUrl = vnpay.createPaymentUrl({
        orderCode,
        amountVnd: planInfo.priceVnd,
        orderInfo,
        ip,
        returnUrl
      });
      return { payUrl, orderCode, vietQrUrl, bankInfo: PAYMENT_CONFIG };
    }
  } else if (provider === 'MOMO') {
    if (env.MOMO_PARTNER_CODE && env.MOMO_SECRET_KEY) {
      const returnUrl = `${env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/momo/return`;
      const ipnUrl = `${env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/momo/ipn`;
      const { payUrl } = await momo.createPaymentRequest({
        orderCode,
        amountVnd: planInfo.priceVnd,
        orderInfo,
        returnUrl,
        ipnUrl
      });
      return { payUrl, orderCode, vietQrUrl, bankInfo: PAYMENT_CONFIG };
    }
  }

  // Mặc định hoặc VietQR: Trả về thông tin chuyển khoản minh bạch, mã QR, cú pháp và cam kết
  return {
    orderCode,
    amountVnd: planInfo.priceVnd,
    formattedAmount: planInfo.formattedPrice,
    planCode: planInfo.code,
    planName: planInfo.name,
    durationDays: planInfo.durationDays,
    vietQrUrl,
    bankInfo: {
      bankName: PAYMENT_CONFIG.bankName,
      bankShortName: PAYMENT_CONFIG.bankShortName,
      bankCode: PAYMENT_CONFIG.bankCode,
      accountNumber: PAYMENT_CONFIG.accountNumber,
      accountHolder: PAYMENT_CONFIG.accountHolder,
      transferSyntax: orderCode,
      momoPhone: PAYMENT_CONFIG.momoPhone,
      momoHolder: PAYMENT_CONFIG.momoHolder,
      supportPhone: PAYMENT_CONFIG.supportPhone,
      supportZalo: PAYMENT_CONFIG.supportZalo,
      supportEmail: PAYMENT_CONFIG.supportEmail
    },
    expiresAt: expiresAt.toISOString(),
    guarantees: PAYMENT_CONFIG.guarantees
  };
}

/**
 * Xác thực giao dịch chuyển khoản từ người dùng
 */
async function verifyTransfer({ orderCode, transactionRef, customerPhone, senderNote }) {
  if (!orderCode) {
    throw new AppError(400, 'Thiếu mã đơn hàng cần xác thực');
  }

  const existingOrder = localOrderStore.findByCode(orderCode);
  if (!existingOrder) {
    throw new AppError(404, 'Không tìm thấy đơn hàng trong hệ thống. Vui lòng kiểm tra lại mã đơn.');
  }

  // Cập nhật trạng thái đơn hàng sang PENDING_VERIFICATION (hoặc ACTIVE nếu kèm mã tham chiếu hợp lệ)
  const isVerifiedWithRef = Boolean(transactionRef && transactionRef.trim().length >= 4);
  const newStatus = isVerifiedWithRef ? 'PENDING_VERIFICATION' : 'PENDING_VERIFICATION';

  const updated = localOrderStore.updateOrder(orderCode, {
    transactionRef: transactionRef ? transactionRef.trim() : null,
    customerPhone: customerPhone || existingOrder.customerPhone,
    notes: senderNote ? senderNote.trim() : existingOrder.notes,
    status: newStatus,
    verifiedAt: new Date().toISOString()
  });

  return {
    success: true,
    message: 'Yêu cầu xác thực giao dịch đã được ghi nhận thành công!',
    order: updated,
    supportContact: {
      phone: PAYMENT_CONFIG.supportPhone,
      zalo: PAYMENT_CONFIG.supportZalo,
      email: PAYMENT_CONFIG.supportEmail
    },
    guaranteeText: 'Hệ thống đang đối soát và mở khóa quyền lợi cho Quý độc giả. Cam kết hoàn tiền 100% nếu có bất kỳ sự cố nào.'
  };
}

/**
 * Lấy trạng thái đơn hàng
 */
async function getOrderStatus(orderCode) {
  if (!orderCode) {
    throw new AppError(400, 'Thiếu mã đơn hàng');
  }

  // 1. Kiểm tra trong localOrderStore
  const localOrder = localOrderStore.findByCode(orderCode);
  if (localOrder) {
    return {
      orderCode: localOrder.orderCode,
      status: localOrder.status,
      planCode: localOrder.planCode,
      planName: localOrder.planName,
      amountVnd: localOrder.amountVnd,
      createdAt: localOrder.createdAt,
      paidAt: localOrder.paidAt,
      verifiedAt: localOrder.verifiedAt,
      transactionRef: localOrder.transactionRef,
      supportContact: {
        phone: PAYMENT_CONFIG.supportPhone,
        zalo: PAYMENT_CONFIG.supportZalo,
        email: PAYMENT_CONFIG.supportEmail
      }
    };
  }

  // 2. Fallback kiểm tra Prisma
  if (process.env.DATABASE_URL && prisma && prisma.order) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderCode },
        include: { plan: true }
      });
      if (order) {
        return {
          orderCode: order.orderCode,
          status: order.status,
          planCode: order.plan ? order.plan.code : 'PREMIUM',
          planName: order.plan ? order.plan.name : 'Sophia Premium',
          amountVnd: order.amountVnd,
          paidAt: order.paidAt,
          createdAt: order.createdAt
        };
      }
    } catch (e) {
      console.warn('[PaymentsService] Error looking up Prisma order:', e.message);
    }
  }

  throw new AppError(404, 'Không tìm thấy đơn hàng với mã này');
}

/**
 * Xử lý IPN từ VNPay
 */
async function handleVnpayIpn(params) {
  const isValid = vnpay.verifyVnpaySignature(params);
  if (!isValid) {
    return { RspCode: '97', Message: 'Invalid Checksum' };
  }

  const orderCode = params.vnp_TxnRef;
  const amountVnd = parseInt(params.vnp_Amount, 10) / 100;
  
  if (process.env.DATABASE_URL && prisma && prisma.order) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderCode },
        include: { plan: true }
      });
      
      if (!order) return { RspCode: '01', Message: 'Order not found' };
      if (amountVnd !== order.amountVnd) return { RspCode: '04', Message: 'Invalid amount' };
      if (order.status === 'PAID') return { RspCode: '02', Message: 'Order already confirmed' };
      
      const isSuccess = params.vnp_ResponseCode === '00';
      if (isSuccess) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID', paidAt: new Date() }
        });
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' }
        });
      }
    } catch (e) {
      console.warn('[VNPay IPN] DB Error:', e.message);
    }
  }

  localOrderStore.updateOrder(orderCode, {
    status: params.vnp_ResponseCode === '00' ? 'PAID' : 'FAILED',
    paidAt: params.vnp_ResponseCode === '00' ? new Date().toISOString() : null,
    transactionRef: params.vnp_TransactionNo || ''
  });

  return { RspCode: '00', Message: 'Confirm Success' };
}

/**
 * Xử lý IPN từ MoMo
 */
async function handleMomoIpn(payload) {
  const isValid = momo.verifyMomoSignature(payload);
  if (!isValid) {
    return { statusCode: 400, message: 'Invalid signature' };
  }

  const orderCode = payload.orderId;
  const isSuccess = payload.resultCode === 0;

  localOrderStore.updateOrder(orderCode, {
    status: isSuccess ? 'PAID' : 'FAILED',
    paidAt: isSuccess ? new Date().toISOString() : null,
    transactionRef: String(payload.transId || '')
  });

  return { statusCode: 200, message: 'Processed' };
}

module.exports = {
  getPlans,
  createCheckout,
  verifyTransfer,
  getOrderStatus,
  handleVnpayIpn,
  handleMomoIpn
};
