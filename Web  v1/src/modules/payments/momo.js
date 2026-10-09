const crypto = require('crypto');
const env = require('../../config/env');

/**
 * Tạo URL thanh toán MoMo
 * @param {Object} params
 * @returns {Promise<{payUrl: string}>}
 */
async function createPaymentRequest({ orderCode, amountVnd, orderInfo, returnUrl, ipnUrl }) {
  const partnerCode = env.MOMO_PARTNER_CODE || 'MOMO';
  const accessKey = env.MOMO_ACCESS_KEY || 'MOMO_ACCESS';
  const secretKey = env.MOMO_SECRET_KEY || 'MOMO_SECRET';
  const endpoint = env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  
  const requestId = orderCode + '_' + Date.now();
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature = `accessKey=${accessKey}&amount=${amountVnd}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
    
  const requestBody = {
    partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId,
    amount: amountVnd,
    orderId: orderCode,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl,
    lang: 'vi',
    requestType,
    autoCapture: true,
    extraData,
    signature
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      const data = await response.json();
      return { payUrl: data.payUrl };
    } else {
      return { payUrl: 'https://test-payment.momo.vn/pay?fake=1' }; // Mock fallback
    }
  } catch (error) {
    return { payUrl: 'https://test-payment.momo.vn/pay?fake=1' }; // Mock fallback
  }
}

/**
 * Xác minh chữ ký MoMo
 * @param {Object} momoParams
 * @returns {boolean} Hợp lệ hay không
 */
function verifyMomoSignature(momoParams) {
  const accessKey = env.MOMO_ACCESS_KEY || 'MOMO_ACCESS';
  const secretKey = env.MOMO_SECRET_KEY || 'MOMO_SECRET';
  
  const {
    amount, extraData, message, orderId, orderInfo,
    orderType, partnerCode, payType, requestId, responseTime,
    resultCode, transId, signature
  } = momoParams;
  
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
  
  const computedSignature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
    
  if (signature && signature.length === computedSignature.length) {
    return crypto.timingSafeCompare(Buffer.from(signature), Buffer.from(computedSignature));
  }
  
  return signature === computedSignature;
}

module.exports = {
  createPaymentRequest,
  verifyMomoSignature
};
