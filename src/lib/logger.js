const pino = require('pino');
const { config } = require('../config/env');

const isDev = config.NODE_ENV === 'development';

// Cấu hình redacted fields để che giấu dữ liệu nhạy cảm
const redactFields = ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'secret'];

let loggerOptions = {
  level: isDev ? 'debug' : 'info',
  redact: redactFields,
};

// Sử dụng pino-pretty trong môi trường dev nếu có
if (isDev) {
  try {
    require('pino-pretty'); // Kiểm tra xem pino-pretty có tồn tại không
    loggerOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  } catch (error) {
    // Không có pino-pretty, log JSON thông thường
  }
}

const logger = pino(loggerOptions);

module.exports = logger;
