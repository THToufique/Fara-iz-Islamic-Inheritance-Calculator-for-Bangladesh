// routes/calculations.js
// Save and retrieve calculation history for logged-in users
// Tested: save returns 201, GET returns user's own calculations only ✓

const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');
const { protect } = require('../middleware/auth');
const { calculateFaraiz } = require('../utils/faraizEngine');

// GET /api/calculations
// Get all saved calculations for current user
router.get('/', protect, async (req, res) => {
  try {
    const calculations = await Calculation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // max 50 saved calculations per user

    res.json({ success: true, calculations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/calculations
// Save a new calculation result
router.post('/', protect, async (req, res) => {
  try {
    const { input, label } = req.body;

    if (!input) {
      return res.status(400).json({ success: false, message: 'Input data is required.' });
    }

    // Re-run engine on the server side (never trust client-sent results)
    const result = calculateFaraiz(input);

    if (!result.hasResult) {
      return res.status(400).json({
        success: false,
        message: 'Could not produce a calculation result with the provided inputs.',
      });
    }

    const calculation = await Calculation.create({
      user: req.user._id,
      input,
      heirs: result.heirs,
      totalDistributed: result.totalDistributed,
      totalFraction: result.totalFraction,
      notes: result.notes,
      label: label || '',
    });

    res.status(201).json({ success: true, calculation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/calculations/:id
// Get a single saved calculation by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const calculation = await Calculation.findOne({
      _id: req.params.id,
      user: req.user._id, // ensure user owns this calculation
    });

    if (!calculation) {
      return res.status(404).json({ success: false, message: 'Calculation not found.' });
    }

    res.json({ success: true, calculation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/calculations/:id
// Delete a saved calculation
router.delete('/:id', protect, async (req, res) => {
  try {
    const calculation = await Calculation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!calculation) {
      return res.status(404).json({ success: false, message: 'Calculation not found.' });
    }

    res.json({ success: true, message: 'Calculation deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
