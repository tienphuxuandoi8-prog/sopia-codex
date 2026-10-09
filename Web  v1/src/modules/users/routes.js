const express = require('express');
const router = express.Router();
const userService = require('./service');
const { requireAuth } = require('../../middleware/requireAuth');
const { requirePermission } = require('../../middleware/requirePermission');
const { validate } = require('../../middleware/validate');
const { userQuerySchema, updateUserStatusSchema, assignUserRolesSchema } = require('./schema');

router.use(requireAuth);

router.get('/', requirePermission('user.view'), validate(userQuerySchema, 'query'), async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.query);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requirePermission('user.view'), async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermission('user.update', 'user.ban'), validate(updateUserStatusSchema), async (req, res, next) => {
  try {
    const user = await userService.updateUser(req, req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/roles', requirePermission('user.assign_role'), validate(assignUserRolesSchema), async (req, res, next) => {
  try {
    const user = await userService.assignRolesToUser(req, req.params.id, req.body.roleIds);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/revoke-sessions', requirePermission('user.ban', 'user.update'), async (req, res, next) => {
  try {
    const result = await userService.revokeUserSessions(req, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission('user.delete'), async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
