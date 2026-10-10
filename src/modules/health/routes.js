const express = require('express');
const { prisma } = require('../../lib/prisma');
const { config } = require('../../config/env');

const router = express.Router();

/**
 * GET /api/v1/health
 * Trả về trạng thái của ứng dụng và kết nối DB
 */
router.get('/', async (req, res) => {
  let dbStatus = 'error';
  
  try {
    if (config.DATABASE_URL) {
      // Thực hiện query nhẹ nhất có thể để kiểm tra DB connection
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } else {
      dbStatus = 'not_configured';
    }
  } catch (error) {
    dbStatus = 'error';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: dbStatus,
  });
});

module.exports = router;
