const prisma = require('../../lib/prisma');
const { AppError } = require('../../middleware/errorHandler');
const { logAudit } = require('../audit/service');

const getAllRoles = async () => {
  return prisma.role.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: { userRoles: true }
      }
    }
  });
};

const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });
  if (!role) throw new AppError(404, 'ROLE_NOT_FOUND');
  return role;
};

const createRole = async (req, { key, name, description }) => {
  const existingRole = await prisma.role.findUnique({ where: { key } });
  if (existingRole) {
    throw new AppError(400, 'ROLE_KEY_EXISTS');
  }

  const role = await prisma.role.create({
    data: {
      key,
      name,
      description,
      isSystem: false
    }
  });

  await logAudit(req, {
    action: 'ROLE_CREATE',
    entityType: 'Role',
    entityId: role.id,
    after: role
  });

  return role;
};

const updateRole = async (req, id, { name, description }) => {
  const roleId = parseInt(id, 10);
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new AppError(404, 'ROLE_NOT_FOUND');

  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: { name, description }
  });

  await logAudit(req, {
    action: 'ROLE_UPDATE',
    entityType: 'Role',
    entityId: roleId,
    before: role,
    after: updatedRole
  });

  return updatedRole;
};

const assignPermissionsToRole = async (req, roleId, permissionIds) => {
  const id = parseInt(roleId, 10);
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new AppError(404, 'ROLE_NOT_FOUND');
  if (role.key === 'super_admin') {
    throw new AppError(400, 'CANNOT_MODIFY_SUPER_ADMIN');
  }

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({
        roleId: id,
        permissionId
      }))
    })
  ]);

  await logAudit(req, {
    action: 'ROLE_ASSIGN_PERMISSIONS',
    entityType: 'Role',
    entityId: id,
    after: { permissionIds }
  });

  return getRoleById(id);
};

const deleteRole = async (req, id) => {
  const roleId = parseInt(id, 10);
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { _count: { select: { userRoles: true } } }
  });

  if (!role) throw new AppError(404, 'ROLE_NOT_FOUND');
  if (role.isSystem) throw new AppError(400, 'CANNOT_DELETE_SYSTEM_ROLE');
  if (role._count.userRoles > 0) throw new AppError(400, 'ROLE_IN_USE');

  await prisma.role.delete({ where: { id: roleId } });

  await logAudit(req, {
    action: 'ROLE_DELETE',
    entityType: 'Role',
    entityId: roleId,
    before: role
  });

  return { message: 'Role deleted' };
};

const getAllPermissions = async () => {
  const permissions = await prisma.permission.findMany();
  // Group by group property
  const grouped = permissions.reduce((acc, perm) => {
    const group = perm.group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});
  return grouped;
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  assignPermissionsToRole,
  deleteRole,
  getAllPermissions
};
