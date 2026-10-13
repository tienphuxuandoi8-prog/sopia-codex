import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Payments & Verification Integration QA Test Suite', () => {
  it('GET /api/v1/payments/plans should return active membership plans', async () => {
    const res = await request(app).get('/api/v1/payments/plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const plans = res.body.data;
    expect(plans.length).toBeGreaterThanOrEqual(2);

    const monthPlan = plans.find(p => p.code === 'PREMIUM_1M');
    expect(monthPlan).toBeDefined();
    expect(monthPlan.priceVnd).toBe(49000);

    const yearPlan = plans.find(p => p.code === 'PREMIUM_1Y');
    expect(yearPlan).toBeDefined();
    expect(yearPlan.priceVnd).toBe(399000);
  });

  it('POST /api/v1/payments/checkout should generate a valid order with VietQR & bank info', async () => {
    const res = await request(app)
      .post('/api/v1/payments/checkout')
      .send({
        planCode: 'PREMIUM_1M',
        provider: 'VIETQR',
        customerEmail: 'reader.test@sophiacodex.vn',
        customerName: 'Độc Giả Triết Học',
        customerPhone: '0988123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const orderData = res.body.data;
    expect(orderData.orderCode).toMatch(/^SC-\d{6}-\d{4}$/);
    expect(orderData.amountVnd).toBe(49000);
    expect(orderData.vietQrUrl).toContain('img.vietqr.io');
    expect(orderData.vietQrUrl).toContain('49000');
    expect(orderData.bankInfo).toBeDefined();
    expect(orderData.bankInfo.accountNumber).toBeDefined();
    expect(orderData.bankInfo.accountHolder).toBe('VU SI TIEN');
    expect(orderData.guarantees).toBeDefined();
  });

  it('POST /api/v1/payments/orders/:code/verify should record transaction reference safely', async () => {
    // 1. Create order
    const checkoutRes = await request(app)
      .post('/api/v1/payments/checkout')
      .send({
        planCode: 'PREMIUM_1Y',
        provider: 'VIETQR',
        customerEmail: 'verify.test@sophiacodex.vn',
        customerName: 'Hội Viên Kiểm Thử',
        customerPhone: '0912345678'
      });

    const orderCode = checkoutRes.body.data.orderCode;

    // 2. Submit transaction verification
    const verifyRes = await request(app)
      .post(`/api/v1/payments/orders/${orderCode}/verify`)
      .send({
        transactionRef: 'FT26101299988',
        senderNote: 'Chuyển khoản gói năm Sophia Codex',
        customerPhone: '0912345678'
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.order.transactionRef).toBe('FT26101299988');
    expect(verifyRes.body.data.order.status).toBe('PENDING_VERIFICATION');

    // 3. Query status
    const statusRes = await request(app).get(`/api/v1/payments/orders/${orderCode}/status`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.success).toBe(true);
    expect(statusRes.body.data.orderCode).toBe(orderCode);
    expect(statusRes.body.data.transactionRef).toBe('FT26101299988');
  });

  it('POST /api/v1/payments/checkout with invalid planCode should return 404', async () => {
    const res = await request(app)
      .post('/api/v1/payments/checkout')
      .send({ planCode: 'INVALID_PLAN_XYZ' });

    expect(res.status).toBe(404);
  });
});
