const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { securityMiddleware } = require('./middleware/security');
const { sessionMiddleware } = require('./middleware/session');
const { csrfProtection, csrfToken } = require('./middleware/csrf');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./lib/logger');

// Import route modules
const healthRoutes = require('./modules/health/routes');
const overviewRoutes = require('./modules/overview/routes');
const bookRoutes = require('./modules/books/routes');
const chapterRoutes = require('./modules/chapters/routes');
const quoteRoutes = require('./modules/quotes/routes');
const philosopherRoutes = require('./modules/philosophers/routes');
const categoryRoutes = require('./modules/categories/routes');
const authRoutes = require('./modules/auth/routes');
const accountRoutes = require('./modules/account/routes');
const usersRoutes = require('./modules/users/routes');
const rolesRoutes = require('./modules/roles/routes');
const auditRoutes = require('./modules/audit/routes');
const adminContentRoutes = require('./modules/admin-content/routes');
const readerRoutes = require('./modules/reader/routes');
const communityRoutes = require('./modules/community/routes');
const gamificationRoutes = require('./modules/gamification/routes');
const aiRoutes = require('./modules/ai/routes');
const paymentsRoutes = require('./modules/payments/routes');
const { prisma } = require('./lib/prisma');

// Khởi tạo Express app
const app = express();

// --- 1. Security & Core Middleware ---
app.use(securityMiddleware());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- 2. Logging Middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      reqId: req.id
    });
  });
  next();
});

// --- 3. Static Assets (phục vụ frontend từ public/) ---
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// --- 4. Authentication & Session ---
app.use(sessionMiddleware);

// --- 5. API V1 Routes ---
const apiV1Router = express.Router();

// Route cấp CSRF token (công khai, GET)
apiV1Router.get('/auth/csrf', csrfToken);

// Áp dụng bảo vệ CSRF cho các thao tác ghi (POST/PUT/PATCH/DELETE)
apiV1Router.use(csrfProtection);

// Mount modules vào API v1
apiV1Router.use('/admin', adminContentRoutes);
apiV1Router.use('/payments', paymentsRoutes);
apiV1Router.use('/reader', readerRoutes);
apiV1Router.use('/community', communityRoutes);
apiV1Router.use('/gamification', gamificationRoutes);
apiV1Router.use('/ai', aiRoutes);
apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/account', accountRoutes);
apiV1Router.use('/users', usersRoutes);
apiV1Router.use('/roles', rolesRoutes);
apiV1Router.use('/audit-logs', auditRoutes);
apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/overview', overviewRoutes);
apiV1Router.use('/books', bookRoutes);
apiV1Router.use('/chapters', chapterRoutes);
apiV1Router.use('/quotes', quoteRoutes);
apiV1Router.use('/philosophers', philosopherRoutes);
apiV1Router.use('/categories', categoryRoutes);

// Daily Cron Job (bảo vệ bởi CRON_SECRET)
apiV1Router.get('/cron/daily', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized cron request' });
  }

  try {
    const now = new Date();
    // 1. Hủy đơn hàng pending quá hạn
    const expiredOrders = await prisma.order.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: now }
      },
      data: { status: 'EXPIRED' }
    });

    // 2. Dọn dẹp token email đã hết hạn
    await prisma.emailToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    // 3. Dọn dẹp session đã hết hạn
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    res.json({
      success: true,
      timestamp: now,
      cleanedOrders: expiredOrders.count
    });
  } catch (err) {
    logger.error({ err }, 'Lỗi khi chạy Daily Cron');
    res.status(500).json({ error: err.message });
  }
});

// Gắn API v1 Router
app.use('/api/v1', apiV1Router);

// --- 6. Legacy API Alias (hỗ trợ tương thích ngược cho frontend) ---
const legacyRouter = express.Router();
legacyRouter.use('/overview', overviewRoutes);
legacyRouter.use('/books', bookRoutes);
legacyRouter.use('/chapters', chapterRoutes);
legacyRouter.use('/quotes', quoteRoutes);
legacyRouter.use('/philosophers', philosopherRoutes);
legacyRouter.use('/categories', categoryRoutes);
legacyRouter.use('/reading-logs', readerRoutes);
legacyRouter.use('/ai', aiRoutes);
app.use('/api', legacyRouter);

// --- 7. Trang Quản trị (Admin Studio) ---
// Admin HTML nằm trong views/ (bảo vệ, không nằm trong public)
app.get('/admin', (req, res) => {
  // Nếu đang ở dev hoặc user có quyền quản trị
  const isDev = process.env.NODE_ENV !== 'production';
  const hasAdmin = req.user && (req.user.isSuperAdmin || (req.user.permissions && req.user.permissions.length > 0));

  if (!isDev && !hasAdmin) {
    return res.redirect('/login.html?next=/admin');
  }

  res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

// Trang Admin Studio legacy redirect
app.get('/admin.html', (req, res) => {
  res.redirect('/admin');
});

// --- 8. Fallback cho Single Page / Client Pages ---
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// --- 9. Xử lý lỗi tập trung ---
app.use(errorHandler);

module.exports = app;
