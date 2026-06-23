// routes/professionals.js
// Professional directory CRUD + search/filter by category and district
// Tested: filter by category=land_surveyor + district=Dhaka returns correct results ✓

const express = require('express');
const router = express.Router();
const Professional = require('../models/Professional');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/professionals
// Browse/search professionals (public)
router.get('/', async (req, res) => {
  try {
    const { category, district, page = 1, limit = 12 } = req.query;

    const filter = { isVerified: true };
    if (category) filter.category = category;
    if (district) filter.district = new RegExp(district, 'i'); // case-insensitive search

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [professionals, total] = await Promise.all([
      Professional.find(filter)
        .sort({ averageRating: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Professional.countDocuments(filter),
    ]);

    res.json({
      success: true,
      professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/professionals/:id
// Get a single professional profile with reviews
router.get('/:id', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id)
      .populate('user', 'name email');

    if (!professional || !professional.isVerified) {
      return res.status(404).json({ success: false, message: 'Professional not found.' });
    }

    const reviews = await Review.find({ professional: professional._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, professional, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/professionals
// Register as a professional (creates pending listing for admin approval)
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, district, upazila, phone, email, bio, experience } = req.body;

    // One professional profile per user
    const existing = await Professional.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a professional listing.',
      });
    }

    const professional = await Professional.create({
      user: req.user._id,
      name, category, district, upazila, phone, email, bio, experience,
      isVerified: false, // admin must approve
    });

    // Link professional profile to user
    await User.findByIdAndUpdate(req.user._id, {
      role: 'professional',
      professionalProfile: professional._id,
    });

    res.status(201).json({
      success: true,
      message: 'Professional listing submitted for review. An admin will approve it shortly.',
      professional,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/professionals/:id/reviews
// Submit a review for a professional
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const professional = await Professional.findById(req.params.id);
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found.' });
    }

    const review = await Review.create({
      professional: professional._id,
      user: req.user._id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this professional.',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
