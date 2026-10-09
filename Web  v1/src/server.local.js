const app = require('./app');
const { config } = require('./config/env');
const logger = require('./lib/logger');
const { prisma } = require('./lib/prisma');

const PORT = config.PORT || 3000;

async function startServer() {
  try {
    // Thử kết nối database, nếu lỗi thì log cảnh báo chứ không chặn app (hoặc chặn tùy logic)
    if (config.DATABASE_URL) {
      await prisma.$connect();
      logger.info('✅ Database connected');
    } else {
      logger.warn('⚠️ No DATABASE_URL provided. App running without database.');
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`👉 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Đang tắt server...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (err) {
    logger.error({ err }, '❌ Lỗi khởi động server');
    process.exit(1);
  }
}

startServer();
