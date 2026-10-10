const { PrismaClient } = require('@prisma/client');
const { config } = require('../config/env');

let prismaInstance = null;

/**
 * Lấy instance của Prisma Client. An toàn khi thiếu DATABASE_URL.
 */
function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const logLevels = config.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'];
  try {
    prismaInstance = new PrismaClient({
      log: logLevels,
    });
  } catch (err) {
    console.warn('[Prisma] Không thể kết nối cơ sở dữ liệu Postgres:', err.message);
    prismaInstance = null;
  }
  return prismaInstance;
}

const prismaProxy = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaClient();
    if (!client) return undefined;
    return client[prop];
  }
});

module.exports = prismaProxy;
module.exports.prisma = prismaProxy;
module.exports.getPrismaClient = getPrismaClient;
