const express = require('express');
const router = express.Router();
const categoryService = require('./service');

// GET / - List categories (public)
router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
