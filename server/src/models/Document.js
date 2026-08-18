const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    docType: {
      type: String,
      enum: ['nid', 'dolil', 'khatian', 'khajana'],
      required: true,
    },
    docNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    holderName: {
      type: String,
      required: true,
      trim: true,
    },
    holderNameBn: {
      type: String,
      trim: true,
      default: '',
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    motherName: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    nidPhoto: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    upazila: {
      type: String,
      default: '',
    },
    ward: {
      type: String,
      default: '',
    },
    // For dolil/khatian/khajana
    landInfo: {
      mouza: { type: String, default: '' },
      jlNo: { type: String, default: '' },
      landArea: { type: String, default: '' },
      landType: { type: String, default: '' },
      plotNo: { type: String, default: '' },
    },
    issueDate: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ docType: 1, docNumber: 1 });
documentSchema.index({ holderName: 1 });

module.exports = mongoose.model('Document', documentSchema);
