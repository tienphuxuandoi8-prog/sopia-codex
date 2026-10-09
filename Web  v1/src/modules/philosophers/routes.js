const express = require('express');
const router = express.Router();
const philosopherService = require('./service');

// GET / - List philosophers (public)
router.get('/', async (req, res, next) => {
  try {
    const philosophers = await philosopherService.getAllPhilosophers();
    res.json(philosophers);
  } catch (error) {
    next(error);
  }
});

// GET /:slug - Get philosopher (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const philosopher = await philosopherService.getPhilosopherBySlug(req.params.slug);
    res.json(philosopher);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
