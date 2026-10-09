const prisma = require('../../lib/prisma');
const vnpay = require('./vnpay');
const momo = require('./momo');
const env = require('../../config/env');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Lấy danh sách các gói cước đang hoạt động
 */
async function getPlans() {
  return await prisma.plan.findMany({
    where: { isActive: true }
  });
}

/**
 * Tạo phiên thanh toán
 */
async function createCheckout(userId, { planCode, provider, ip }) {
  const plan = await prisma.plan.findUnique({
    where: { code: planCode }
  });
  if (!plan) {
    throw new AppError(404, 'Plan not found');
  }

  const orderCode = `SC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      userId,
      planId: plan.id,
      orderCode,
      status: 'PENDING',
      amountVnd: plan.priceVnd,
      expiresAt,
      provider
    }
  });

  const orderInfo = `Thanh toan don hang ${orderCode}`;
  
  if (provider === 'VNPAY') {
    const returnUrl = `${env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/vnpay/return`;
    const payUrl = vnpay.createPaymentUrl({
      orderCode,
      amountVnd: plan.priceVnd,
      orderInfo,
      ip,
      returnUrl
    });
    return { payUrl, orderCode };
  } else if (provider === 'MOMO') {
    const returnUrl = `${env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/momo/return`;
    const ipnUrl = `${env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/momo/ipn`;
    
    const { payUrl } = await momo.createPaymentRequest({
      orderCode,
      amountVnd: plan.priceVnd,
      orderInfo,
      returnUrl,
      ipnUrl
    });
    return { payUrl, orderCode };
  } else {
    throw new AppError(400, 'Invalid provider');
  }
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
  
  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: { plan: true }
  });
  
  if (!order) {
    return { RspCode: '01', Message: 'Order not found' };
  }
  
  if (amountVnd !== order.amountVnd) {
    return { RspCode: '04', Message: 'Invalid amount' };
  }
  
  if (order.status === 'PAID') {
    return { RspCode: '02', Message: 'Order already confirmed' };
  }
  
  const isSuccess = params.vnp_ResponseCode === '00';
  
  await prisma.$transaction(async (tx) => {
    if (isSuccess) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() }
      });
      
      const activeSub = await tx.subscription.findFirst({
        where: {
          userId: order.userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });
      
      const now = new Date();
      let startsAt = now;
      if (activeSub && activeSub.expiresAt > now) {
        startsAt = activeSub.expiresAt;
      }
      
      const expiresAt = new Date(startsAt.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);
      
      await tx.subscription.create({
        data: {
          userId: order.userId,
          planId: order.planId,
          startsAt,
          expiresAt,
          source: 'PAYMENT',
          status: 'ACTIVE'
        }
      });
      
      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: 'VNPAY',
          transactionId: params.vnp_TransactionNo || '',
          amountVnd: amountVnd,
          status: 'SUCCESS',
          rawResponse: JSON.stringify(params)
        }
      });
    } else {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' }
      });
    }
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
  const amountVnd = parseInt(payload.amount, 10);
  
  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: { plan: true }
  });
  
  if (!order) return { statusCode: 404, message: 'Order not found' };
  if (amountVnd !== order.amountVnd) return { statusCode: 400, message: 'Invalid amount' };
  if (order.status === 'PAID') return { statusCode: 200, message: 'Already processed' };
  
  const isSuccess = payload.resultCode === 0;
  
  await prisma.$transaction(async (tx) => {
    if (isSuccess) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() }
      });
      
      const activeSub = await tx.subscription.findFirst({
        where: {
          userId: order.userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });
      
      const now = new Date();
      let startsAt = now;
      if (activeSub && activeSub.expiresAt > now) {
        startsAt = activeSub.expiresAt;
      }
      
      const expiresAt = new Date(startsAt.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);
      
      await tx.subscription.create({
        data: {
          userId: order.userId,
          planId: order.planId,
          startsAt,
          expiresAt,
          source: 'PAYMENT',
          status: 'ACTIVE'
        }
      });
      
      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: 'MOMO',
          transactionId: String(payload.transId || ''),
          amountVnd: amountVnd,
          status: 'SUCCESS',
          rawResponse: JSON.stringify(payload)
        }
      });
    } else {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' }
      });
    }
  });

  return { statusCode: 200, message: 'Processed' };
}

/**
 * Lấy trạng thái đơn hàng
 */
async function getOrderStatus(orderCode) {
  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: { plan: true }
  });
  
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  
  return {
    status: order.status,
    paidAt: order.paidAt,
    plan: order.plan
  };
}

module.exports = {
  getPlans,
  createCheckout,
  handleVnpayIpn,
  handleMomoIpn,
  getOrderStatus
};
