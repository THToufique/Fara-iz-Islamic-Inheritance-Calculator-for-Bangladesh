// routes/articles.js
// Blog/article CRUD - public read, admin write
// Tested: GET /api/articles returns only published articles, admin can create ✓

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, authorize } = require('../middleware/auth');

// GET /api/articles
// List published articles (public)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const filter = { isPublished: true };
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'), // don't send full content in list view
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      articles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/articles/:slug
// Get a single article by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate('author', 'name');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/articles
// Create article (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, content, excerpt, category, isPublished } = req.body;

    const article = await Article.create({
      title, content, excerpt, category,
      isPublished: isPublished || false,
      author: req.user._id,
    });

    res.status(201).json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/articles/:id
// Update article (admin only)
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/articles/:id
// Delete article (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, message: 'Article deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
