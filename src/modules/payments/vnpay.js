const crypto = require('crypto');
const env = require('../../config/env');

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} params
 * @param {string} params.orderCode Mã đơn hàng
 * @param {number} params.amountVnd Số tiền VND
 * @param {string} params.orderInfo Thông tin đơn hàng
 * @param {string} params.ip IP của khách hàng
 * @param {string} params.returnUrl URL chuyển hướng sau khi thanh toán
 * @returns {string} URL thanh toán
 */
function createPaymentUrl({ orderCode, amountVnd, orderInfo, ip, returnUrl }) {
  const tmnCode = env.VNPAY_TMN_CODE;
  const secretKey = env.VNPAY_HASH_SECRET;
  let vnpUrl = env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  
  const createDate = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amountVnd * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ip || '127.0.0.1',
    vnp_CreateDate: createDate
  };

  const sortedParams = sortObject(vnp_Params);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  sortedParams.vnp_SecureHash = signed;
  
  vnpUrl += '?' + new URLSearchParams(sortedParams).toString();
  return vnpUrl;
}

/**
 * Xác minh chữ ký VNPay
 * @param {Object} vnpayParams Các tham số từ VNPay
 * @returns {boolean} Hợp lệ hay không
 */
function verifyVnpaySignature(vnpayParams) {
  const secretKey = env.VNPAY_HASH_SECRET;
  const secureHash = vnpayParams.vnp_SecureHash;

  delete vnpayParams.vnp_SecureHash;
  delete vnpayParams.vnp_SecureHashType;

  const sortedParams = sortObject(vnpayParams);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash && secureHash.length === signed.length) {
    return crypto.timingSafeCompare(Buffer.from(secureHash), Buffer.from(signed));
  }
  return secureHash === signed;
}

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

module.exports = {
  createPaymentUrl,
  verifyVnpaySignature
};
