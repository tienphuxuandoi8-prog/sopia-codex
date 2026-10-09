const express = require('express');
const router = express.Router();
const service = require('./service');
const { validate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/requireAuth');
const { requirePermission } = require('../../middleware/requirePermission');
const schemas = require('./schema');

// Error wrapping handler
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// -- Reviews --

router.get('/books/:bookId/reviews', asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await service.getBookReviews(req.params.bookId, { 
    page: page ? parseInt(page) : 1, 
    limit: limit ? parseInt(limit) : 20 
  });
  res.json({ data: result });
}));

router.post('/books/:bookId/reviews', requireAuth, validate(schemas.reviewSchema), asyncHandler(async (req, res) => {
  const result = await service.upsertReview(req.user.id, req.params.bookId, req.body);
  res.status(200).json({ data: result });
}));

router.delete('/reviews/:id', requireAuth, asyncHandler(async (req, res) => {
  // If user has admin roles, this can be extended to pass isAdmin = true
  const result = await service.deleteReview(req.user.id, parseInt(req.params.id) || req.params.id, false);
  res.status(200).json({ data: result });
}));

// -- Comments --

router.get('/comments', asyncHandler(async (req, res) => {
  const { bookId, chapterId, page, limit } = req.query;
  const result = await service.getComments({
    bookId, chapterId,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 50
  });
  res.json({ data: result });
}));

router.post('/comments', requireAuth, validate(schemas.commentSchema), asyncHandler(async (req, res) => {
  const result = await service.createComment(req.user.id, req.body);
  res.status(201).json({ data: result });
}));

router.patch('/comments/:id', requireAuth, validate(schemas.updateCommentSchema), asyncHandler(async (req, res) => {
  const result = await service.updateComment(req.user.id, parseInt(req.params.id) || req.params.id, req.body);
  res.status(200).json({ data: result });
}));

router.delete('/comments/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await service.deleteComment(req.user.id, parseInt(req.params.id) || req.params.id, false);
  res.status(200).json({ data: result });
}));

router.post('/comments/:id/report', requireAuth, validate(schemas.reportSchema), asyncHandler(async (req, res) => {
  const result = await service.reportComment(req.user.id, parseInt(req.params.id) || req.params.id, req.body.reason);
  res.status(200).json({ data: result });
}));

// -- Admin/Moderation --

router.get('/moderation/comments', requireAuth, requirePermission('comment.moderate'), asyncHandler(async (req, res) => {
  const { status, reportedOnly, page, limit } = req.query;
  const result = await service.getAdminComments({
    status,
    reportedOnly: reportedOnly === 'true',
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 30
  });
  res.json({ data: result });
}));

router.patch('/moderation/comments/:id', requireAuth, requirePermission('comment.moderate'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await service.setCommentStatus(parseInt(req.params.id) || req.params.id, status);
  res.status(200).json({ data: result });
}));

router.get('/moderation/banned-words', requireAuth, requirePermission('banned_word.manage'), asyncHandler(async (req, res) => {
  const result = await service.getBannedWords();
  res.json({ data: result });
}));

router.post('/moderation/banned-words', requireAuth, requirePermission('banned_word.manage'), validate(schemas.bannedWordSchema), asyncHandler(async (req, res) => {
  const result = await service.addBannedWord(req.body.word, req.user.id);
  res.status(201).json({ data: result });
}));

router.delete('/moderation/banned-words/:id', requireAuth, requirePermission('banned_word.manage'), asyncHandler(async (req, res) => {
  const result = await service.deleteBannedWord(parseInt(req.params.id) || req.params.id);
  res.status(200).json({ data: result });
}));

module.exports = router;
