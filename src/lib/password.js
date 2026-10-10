const argon2 = require('@node-rs/argon2');

/**
 * Băm mật khẩu sử dụng argon2id với các cài đặt đề xuất
 * memoryCost: 65536 (64MB)
 * timeCost: 3
 * parallelism: 1
 * @param {string} plain Mật khẩu gốc
 * @returns {Promise<string>} Mật khẩu đã băm
 */
async function hashPassword(plain) {
  if (!plain || typeof plain !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return argon2.hash(plain, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    type: argon2.argon2id
  });
}

/**
 * Kiểm tra mật khẩu
 * @param {string} hash Mật khẩu đã băm trong database
 * @param {string} plain Mật khẩu cần kiểm tra
 * @returns {Promise<boolean>} Đúng nếu khớp
 */
async function verifyPassword(hash, plain) {
  try {
    return await argon2.verify(hash, plain);
  } catch (err) {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};
