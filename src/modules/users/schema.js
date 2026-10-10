const { z } = require('zod');

const userQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'MUTED', 'BANNED']).optional(),
  roleKey: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

const updateUserStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'MUTED', 'BANNED']),
  displayName: z.string().optional()
});

const assignUserRolesSchema = z.object({
  roleIds: z.array(z.number().int())
});

module.exports = {
  userQuerySchema,
  updateUserStatusSchema,
  assignUserRolesSchema
};
