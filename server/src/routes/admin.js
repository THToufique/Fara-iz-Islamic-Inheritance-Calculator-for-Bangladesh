// routes/admin.js
// Admin-only management routes: approve professionals, manage users
// Tested: only admin role can access, non-admin returns 403 ✓

const express = require('express');
const router = express.Router();
const Professional = require('../models/Professional');
const User = require('../models/User');
const Calculation = require('../models/Calculation');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats
// Platform usage stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCalculations, totalProfessionals, pendingProfessionals] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Calculation.countDocuments(),
        Professional.countDocuments({ isVerified: true }),
        Professional.countDocuments({ isVerified: false }),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCalculations,
        totalProfessionals,
        pendingProfessionals,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/professionals/pending
// List pending professional applications
router.get('/professionals/pending', async (req, res) => {
  try {
    const pending = await Professional.find({ isVerified: false })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, professionals: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/professionals/:id/approve
// Approve a professional listing
router.patch('/professionals/:id/approve', async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found.' });
    }

    res.json({ success: true, message: 'Professional approved.', professional });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/professionals/:id
// Remove a professional listing
router.delete('/professionals/:id', async (req, res) => {
  try {
    await Professional.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Professional listing removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
// List all registered users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/users/:id/deactivate
// Deactivate a user account
router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deactivated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
