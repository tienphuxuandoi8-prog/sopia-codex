const { prisma } = require('../lib/prisma');

/**
 * Factory tạo rate limiter sử dụng Postgres Prisma
 * @param {Object} options Cấu hình (windowMs, max, keyGenerator)
 */
function rateLimit({ 
  windowMs = 60 * 1000, // 1 phút mặc định
  max = 100, // 100 request/phút
  keyGenerator = (req) => req.ip || req.socket.remoteAddress 
} = {}) {
  
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      if (!key) return next();
      
      // Khóa endpoint kết hợp IP để rate limit chính xác hơn nếu cần, nhưng default là key theo IP.
      const id = `${req.originalUrl || req.path}:${key}`;
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + windowMs);

      // Thử dùng Prisma (cần schema RateLimit tồn tại)
      try {
        const record = await prisma.rateLimit.upsert({
          where: { id },
          update: {
            count: { increment: 1 },
            // Nếu đã quá thời hạn, reset lại
            // Prisma không có điều kiện upsert động như vậy dễ dàng,
            // nên ta sẽ cập nhật lại nếu quá hạn trong code
          },
          create: {
            id,
            count: 1,
            expiresAt
          }
        });

        // Nếu record đã hết hạn, ta reset lại đếm
        if (record.expiresAt < now) {
          await prisma.rateLimit.update({
            where: { id },
            data: { count: 1, expiresAt }
          });
          return next();
        }

        // Kiểm tra vượt mức
        if (record.count > max) {
          res.setHeader('Retry-After', Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000));
          return res.status(429).json({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.'
            }
          });
        }
      } catch (dbError) {
        // Fallback nếu chưa có bảng RateLimit hoặc DB lỗi thì log và cho qua
        const logger = require('../lib/logger');
        logger.warn({ dbError }, 'Rate limit DB Error');
      }
      
      // Cleanup ngẫu nhiên 1% cơ hội
      if (Math.random() < 0.01) {
        try {
          await prisma.rateLimit.deleteMany({
            where: { expiresAt: { lt: now } }
          });
        } catch (e) {
          // Bỏ qua lỗi cleanup
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { rateLimit };
