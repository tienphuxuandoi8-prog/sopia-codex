const logger = require('../lib/logger');
const { config } = require('../config/env');
const { ZodError } = require('zod');

// Lớp lỗi tùy chỉnh cho ứng dụng
class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware xử lý lỗi tập trung
 */
function errorHandler(err, req, res, next) {
  // Bỏ qua nếu đã gửi response
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = undefined;

  // Xử lý lỗi xác thực Zod
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Dữ liệu không hợp lệ';
    details = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
  }
  
  // Xử lý lỗi Prisma đã biết
  else if (err.code === 'P2002') {
    statusCode = 409;
    code = 'UNIQUE_CONSTRAINT_FAILED';
    message = 'Dữ liệu đã tồn tại trong hệ thống';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Không tìm thấy tài nguyên yêu cầu';
  }

  // Log lỗi
  if (statusCode >= 500) {
    logger.error({ 
      err, 
      reqId: req.id,
      url: req.originalUrl,
      method: req.method
    }, 'Unhandled Error');
  } else {
    logger.warn({ 
      code,
      message,
      reqId: req.id,
      url: req.originalUrl
    }, 'Operational Error');
  }

  // Cấu trúc response trả về client
  const errorResponse = {
    error: {
      code,
      message,
      ...(details && { details })
    }
  };

  // Trong dev, có thể leak stack trace
  if (config.NODE_ENV === 'development' && statusCode >= 500) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = { errorHandler, AppError };
