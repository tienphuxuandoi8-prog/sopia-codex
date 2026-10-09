const express = require('express');
const router = express.Router();
const auditService = require('./service');
const { requireAuth } = require('../../middleware/requireAuth');
const { requirePermission } = require('../../middleware/requirePermission');

router.get('/', requireAuth, requirePermission('audit.view'), async (req, res, next) => {
  try {
    const { page, limit, actorId, action, entityType } = req.query;
    const result = await auditService.getAuditLogs({ page, limit, actorId, action, entityType });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
