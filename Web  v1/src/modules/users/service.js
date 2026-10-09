const prisma = require('../../lib/prisma');
const { AppError } = require('../../middleware/errorHandler');
const { logAudit } = require('../audit/service');

const getUsers = async ({ search, status, roleKey, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { displayName: { contains: search } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (roleKey) {
    where.userRoles = {
      some: {
        role: { key: roleKey }
      }
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        userRoles: {
          include: {
            role: { select: { key: true, name: true } }
          }
        },
        _count: {
          select: { readingSessions: true }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getUserById = async (id) => {
  const userId = parseInt(id, 10);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true }
      },
      readingSessions: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      subscription: true,
      userStats: true
    }
  });

  if (!user) throw new AppError(404, 'USER_NOT_FOUND');
  return user;
};

const revokeUserSessions = async (req, targetUserId) => {
  const userId = parseInt(targetUserId, 10);
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  await logAudit(req, {
    action: 'USER_REVOKE_SESSIONS',
    entityType: 'User',
    entityId: userId
  });

  return { message: 'User sessions revoked' };
};

const updateUser = async (req, id, data) => {
  const userId = parseInt(id, 10);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND');

  if (data.status === 'BANNED' || data.status === 'MUTED') {
    await revokeUserSessions(req, userId);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data
  });

  await logAudit(req, {
    action: 'USER_UPDATE',
    entityType: 'User',
    entityId: userId,
    before: user,
    after: updatedUser
  });

  return updatedUser;
};

const assertCanGrant = async (actorUserId, roleIdsToAssign) => {
  const superAdminRole = await prisma.role.findUnique({ where: { key: 'super_admin' } });
  if (!superAdminRole) return;
  
  if (roleIdsToAssign.includes(superAdminRole.id)) {
    const actorSuperAdminCount = await prisma.userRole.count({
      where: { userId: actorUserId, roleId: superAdminRole.id }
    });
    if (actorSuperAdminCount === 0) {
      throw new AppError(403, 'CANNOT_ASSIGN_SUPER_ADMIN');
    }
  }
};

const assignRolesToUser = async (req, targetUserId, roleIds) => {
  const userId = parseInt(targetUserId, 10);
  const actorId = req.user.id;

  await assertCanGrant(actorId, roleIds);

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId } }),
    prisma.userRole.createMany({
      data: roleIds.map(roleId => ({
        userId,
        roleId,
        assignedBy: actorId
      }))
    })
  ]);

  await logAudit(req, {
    action: 'USER_ASSIGN_ROLES',
    entityType: 'User',
    entityId: userId,
    after: { roleIds }
  });

  return getUserById(userId);
};

const deleteUser = async (req, targetUserId) => {
  const userId = parseInt(targetUserId, 10);
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    include: { userRoles: { include: { role: true } } }
  });

  if (!user) throw new AppError(404, 'USER_NOT_FOUND');

  const isSuperAdmin = user.userRoles.some(ur => ur.role.key === 'super_admin');
  if (isSuperAdmin && user.status === 'ACTIVE') {
    const superAdminRole = await prisma.role.findUnique({ where: { key: 'super_admin' } });
    if (superAdminRole) {
      const activeSuperAdmins = await prisma.user.count({
        where: {
          status: 'ACTIVE',
          userRoles: {
            some: { roleId: superAdminRole.id }
          }
        }
      });
      if (activeSuperAdmins <= 1) {
        throw new AppError(400, 'CANNOT_DELETE_LAST_SUPER_ADMIN');
      }
    }
  }

  await revokeUserSessions(req, userId);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      status: 'BANNED'
    }
  });

  await logAudit(req, {
    action: 'USER_DELETE',
    entityType: 'User',
    entityId: userId,
    before: user,
    after: updatedUser
  });

  return { message: 'User deleted' };
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  assignRolesToUser,
  revokeUserSessions,
  deleteUser
};
