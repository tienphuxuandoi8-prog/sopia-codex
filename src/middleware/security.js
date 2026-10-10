const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const crypto = require('crypto');
const { config } = require('../config/env');

/**
 * Khởi tạo và trả về mảng các middleware bảo mật cốt lõi
 */
function securityMiddleware() {
  return [
    // Helmet bảo vệ khỏi các lỗ hổng web phổ biến bằng cách thiết lập HTTP headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.tailwindcss.com', 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
    
    // Nén payload
    compression(),
    
    // Cấu hình CORS
    cors({
      origin: config.APP_URL,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
    
    // Thêm Security headers bổ sung và Request ID vào header
    (req, res, next) => {
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      const reqId = req.headers['x-request-id'] || crypto.randomUUID();
      req.id = reqId;
      res.setHeader('X-Request-Id', reqId);
      next();
    }
  ];
}

module.exports = { securityMiddleware };
