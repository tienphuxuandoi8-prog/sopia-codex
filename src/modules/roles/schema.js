const { z } = require('zod');

const createRoleSchema = z.object({
  key: z.string().min(2).max(30).regex(/^[a-z0-9_-]+$/, "Chỉ chứa ký tự thường, số, gạch ngang, gạch dưới"),
  name: z.string().min(2).max(50),
  description: z.string().optional()
});

const updateRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional()
});

const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.number().int())
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema
};
