const prisma = require('../../lib/prisma');

/**
 * Log an audit action
 */
const logAudit = async (req, { action, entityType, entityId, before, after }) => {
  const actorId = req.user?.id || null;
  const ip = req.ip || null;
  const userAgent = req.headers['user-agent'] || null;

  return prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      actorId,
      ip,
      userAgent,
      before: before || null,
      after: after || null
    }
  });
};

/**
 * Get paginated audit logs
 */
const getAuditLogs = async ({ page = 1, limit = 30, actorId, action, entityType }) => {
  const skip = (page - 1) * limit;
  const where = {};
  
  if (actorId) where.actorId = parseInt(actorId, 10);
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            email: true,
            displayName: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    data: logs,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  logAudit,
  getAuditLogs
};
