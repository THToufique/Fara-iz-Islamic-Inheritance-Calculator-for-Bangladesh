// middleware/validate.js
// Input validation middleware using express-validator
// Tested: missing estateValue returns 400 with clear error message ✓

const { validationResult, body } = require('express-validator');

// Run validation result check - use after validation chains
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Validation rules for the calculate endpoint
const calculateValidation = [
  body('estateValue')
    .isNumeric().withMessage('Estate value must be a number')
    .isFloat({ min: 1 }).withMessage('Estate value must be greater than 0'),
  body('deceasedGender')
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('numSons')
    .optional().isInt({ min: 0 }).withMessage('Number of sons must be 0 or more'),
  body('numDaughters')
    .optional().isInt({ min: 0 }).withMessage('Number of daughters must be 0 or more'),
  body('numWives')
    .optional().isInt({ min: 0, max: 4 }).withMessage('Number of wives must be between 0 and 4'),
];

// Validation rules for auth endpoints
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { validate, calculateValidation, registerValidation, loginValidation };
