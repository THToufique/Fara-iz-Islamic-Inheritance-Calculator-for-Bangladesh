// models/Professional.js
// Stores professional service provider listings (land surveyors, registration agents, lawyers)
// Tested: create professional, verify district filter works in GET /api/professionals ✓

const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: [true, 'Professional name is required'],
      trim: true,
    },

    // Service category - what type of professional are they?
    category: {
      type: String,
      required: true,
      enum: ['land_surveyor', 'registration_agent', 'lawyer', 'consultant'],
    },

    // Location
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    upazila: {
      type: String,
      trim: true,
      default: '',
    },

    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    bio: {
      type: String,
      maxlength: [600, 'Bio cannot exceed 600 characters'],
      default: '',
    },

    experience: {
      type: Number, // years of experience
      min: 0,
      default: 0,
    },

    // Admin approval workflow
    isVerified: {
      type: Boolean,
      default: false, // must be approved by admin before showing publicly
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search/filter queries
professionalSchema.index({ category: 1, district: 1, isVerified: 1 });

module.exports = mongoose.model('Professional', professionalSchema);
