const crypto = require('crypto');

/**
 * Tạo token ngẫu nhiên dạng hex
 * @param {number} bytes Số bytes
 * @returns {string} Token dạng chuỗi hex
 */
function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Băm dữ liệu bằng thuật toán SHA-256
 * @param {string} input Dữ liệu cần băm
 * @returns {string} Chuỗi băm dạng hex
 */
function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Tạo mã xác thực thông điệp dựa trên băm (HMAC) bằng SHA-256
 * @param {string} key Khóa bí mật
 * @param {string} data Dữ liệu
 * @returns {string} Chuỗi HMAC dạng hex
 */
function hmacSha256(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * So sánh an toàn thời gian để chống tấn công timing
 * @param {string} a Chuỗi thứ nhất
 * @param {string} b Chuỗi thứ hai
 * @returns {boolean} True nếu hai chuỗi bằng nhau
 */
function timingSafeCompare(a, b) {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (error) {
    return false;
  }
}

module.exports = {
  randomToken,
  generateToken: randomToken,
  sha256,
  hashString: sha256,
  hmacSha256,
  timingSafeCompare
};
