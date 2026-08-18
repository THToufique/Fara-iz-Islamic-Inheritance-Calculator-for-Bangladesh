const mongoose = require('mongoose');

const heirRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  nidNumber: { type: String, required: true },
  nidVerified: { type: Boolean, default: false },
  shareFraction: { type: String, default: '' },
  sharePercent: { type: String, default: '' },
  shareAmount: { type: Number, default: 0 },
  landShareArea: { type: Number, default: 0 },
  landShareUnit: { type: String, default: 'decimal' },
}, { _id: false });

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    calculation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Calculation',
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    // Step 1: Heir NID verification
    heirs: [heirRegistrationSchema],

    // Step 2: Property documents
    propertyDocuments: {
      dolilNumber: { type: String, default: '' },
      dolilVerified: { type: Boolean, default: false },
      khatianNumber: { type: String, default: '' },
      khatianVerified: { type: Boolean, default: false },
      khajanaNumber: { type: String, default: '' },
      khajanaVerified: { type: Boolean, default: false },
    },

    // Property details
    property: {
      mouza: { type: String, default: '' },
      district: { type: String, default: '' },
      upazila: { type: String, default: '' },
      landArea: { type: Number, default: 0 },
      landUnit: { type: String, default: 'decimal' },
      plotNo: { type: String, default: '' },
      jlNo: { type: String, default: '' },
    },

    // Step 3: Review snapshot
    estateValue: { type: Number, default: 0 },
    totalDistributed: { type: Number, default: 0 },

    // Submission metadata
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewNote: { type: String, default: '' },

    // Registration office info
    registrationOffice: {
      name: { type: String, default: '' },
      subRegistrar: { type: String, default: '' },
      district: { type: String, default: '' },
      upazila: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index({ user: 1, createdAt: -1 });
registrationSchema.index({ status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
