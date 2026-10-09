const { PrismaClient } = require('@prisma/client');
const { config } = require('../config/env');

let prisma;

/**
 * Lấy instance của Prisma Client. Sử dụng lazy initialization.
 * Singleton pattern để tránh tạo nhiều connections.
 */
function getPrismaClient() {
  if (!prisma) {
    const logLevels = config.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'];
    prisma = new PrismaClient({
      log: logLevels,
    });
  }
  return prisma;
}

module.exports = { prisma: getPrismaClient() };
