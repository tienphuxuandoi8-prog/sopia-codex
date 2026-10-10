const express = require('express');
const router = express.Router();
const roleService = require('./service');
const { requireAuth } = require('../../middleware/requireAuth');
const { requirePermission } = require('../../middleware/requirePermission');
const { validate } = require('../../middleware/validate');
const { createRoleSchema, updateRoleSchema, assignPermissionsSchema } = require('./schema');

router.use(requireAuth);

router.get('/', requirePermission('role.view'), async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

router.get('/permissions', requirePermission('role.view'), async (req, res, next) => {
  try {
    const permissions = await roleService.getAllPermissions();
    res.json(permissions);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requirePermission('role.view'), async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission('role.manage'), validate(createRoleSchema), async (req, res, next) => {
  try {
    const role = await roleService.createRole(req, req.body);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requirePermission('role.manage'), validate(updateRoleSchema), async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req, req.params.id, req.body);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/permissions', requirePermission('role.manage'), validate(assignPermissionsSchema), async (req, res, next) => {
  try {
    const role = await roleService.assignPermissionsToRole(req, req.params.id, req.body.permissionIds);
    res.json(role);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission('role.manage'), async (req, res, next) => {
  try {
    const result = await roleService.deleteRole(req, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
