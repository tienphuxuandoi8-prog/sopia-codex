const { prisma } = require('../lib/prisma');
const { sha256 } = require('../lib/crypto');
const { config } = require('../config/env');

const SESSION_UPDATE_THRESHOLD = 5 * 60 * 1000; // 5 phút

/**
 * Middleware quản lý phiên, chạy trên mỗi request.
 * Đọc cookie 'sid' (hoặc '__Host-sid'), tìm trong database và gán req.user, req.session.
 */
async function sessionMiddleware(req, res, next) {
  req.user = null;
  req.session = null;

  // Lấy token từ cookie
  const cookieName = config.NODE_ENV === 'production' ? '__Host-sid' : 'sid';
  const token = req.cookies?.[cookieName];

  if (!token) {
    return next();
  }

  if (!config.DATABASE_URL) {
    const localUserStore = require('../lib/localUserStore');
    const sessionData = localUserStore.getSession(token);
    if (sessionData && sessionData.user) {
      req.session = sessionData.session;
      const user = sessionData.user;
      req.user = {
        ...user,
        permissions: user.permissions || (user.isSuperAdmin ? ['*'] : ['reader.read']),
        isSuperAdmin: !!user.isSuperAdmin
      };
    }
    return next();
  }

  try {
    // Hash token để tìm trong database
    const tokenHash = sha256(token);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      // Session không hợp lệ, bị thu hồi hoặc đã hết hạn
      return next();
    }

    // Gán dữ liệu cho request
    req.session = session;

    // Map permissions từ roles
    const user = session.user;
    if (user) {
      const allPermissions = new Set();
      let isSuperAdmin = false;

      (user.roles || []).forEach(ur => {
        if (ur.role && ur.role.key === 'super_admin') {
          isSuperAdmin = true;
        }
        if (ur.role && ur.role.permissions) {
          ur.role.permissions.forEach(rp => {
            if (rp.permission && rp.permission.key) {
              allPermissions.add(rp.permission.key);
            }
          });
        }
      });

      req.user = {
        ...user,
        permissions: Array.from(allPermissions),
        isSuperAdmin
      };
    }

    // Cập nhật lastSeenAt nếu đã trôi qua khoảng thời gian threshold (5 phút)
    const now = Date.now();
    if (!session.lastSeenAt || (now - new Date(session.lastSeenAt).getTime()) > SESSION_UPDATE_THRESHOLD) {
      prisma.session.update({
        where: { id: session.id },
        data: {
          lastSeenAt: new Date(),
          ip: req.ip || req.socket?.remoteAddress,
        }
      }).catch(err => {
        const logger = require('../lib/logger');
        logger.error({ err }, 'Lỗi cập nhật session lastSeenAt');
      });
    }

    next();
  } catch (error) {
    // Nếu DB chưa sẵn sàng hoặc query fail, log nhẹ và cho request tiếp tục như khách
    const logger = require('../lib/logger');
    logger.warn({ err: error.message }, 'Session lookup skipped (DB unavailable or invalid token)');
    next();
  }
}

module.exports = { sessionMiddleware };
