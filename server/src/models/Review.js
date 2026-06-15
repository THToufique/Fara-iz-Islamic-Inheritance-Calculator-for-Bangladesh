// models/Review.js
// Stores user reviews for professionals
// Tested: prevent duplicate reviews from same user for same professional ✓

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per professional
reviewSchema.index({ professional: 1, user: 1 }, { unique: true });

// After saving a review, update the professional's average rating
reviewSchema.post('save', async function () {
  const Professional = mongoose.model('Professional');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { professional: this.professional } },
    { $group: { _id: '$professional', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Professional.findByIdAndUpdate(this.professional, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
