// routes/calculate.js
// Core calculation endpoint - runs the Fara'iz engine
// Tested: spouse+2sons+1daughter case returns correct fractions, totals match ✓

const express = require('express');
const router = express.Router();
const { calculateFaraiz } = require('../utils/faraizEngine');
const { optionalAuth } = require('../middleware/auth');
const { calculateValidation, validate } = require('../middleware/validate');

// POST /api/calculate
// Run the Fara'iz engine. Auth is optional (logged-in users can save results)
router.post('/', optionalAuth, calculateValidation, validate, async (req, res) => {
  try {
    const {
      estateValue,
      deceasedGender,
      numWives = 0,
      husbandAlive = false,
      numSons = 0,
      numDaughters = 0,
      fatherAlive = false,
      motherAlive = false,
    } = req.body;

    const result = calculateFaraiz({
      estateValue: parseFloat(estateValue),
      deceasedGender,
      numWives: parseInt(numWives),
      husbandAlive: Boolean(husbandAlive),
      numSons: parseInt(numSons),
      numDaughters: parseInt(numDaughters),
      fatherAlive: Boolean(fatherAlive),
      motherAlive: Boolean(motherAlive),
    });

    res.json({
      success: true,
      result,
      // Let frontend know if this user can save (logged in)
      canSave: !!req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
