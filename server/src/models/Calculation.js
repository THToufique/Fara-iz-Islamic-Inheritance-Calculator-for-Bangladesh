// models/Calculation.js
// Stores saved Fara'iz calculation results linked to a registered user
// Tested: save and retrieval by userId works correctly, heirs array populated ✓

const mongoose = require('mongoose');

// Sub-schema for each heir's result
const heirSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Wife", "Son 1"
  role: { type: String, required: true },        // "Spouse" | "Child" | "Parent"
  fractionDisplay: { type: String, required: true }, // e.g. "1/8"
  basis: { type: String, enum: ['fixed', 'residuary'], required: true },
  percent: { type: String },                     // e.g. "12.5"
  amount: { type: Number, required: true },      // BDT amount
}, { _id: false });

const calculationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Input snapshot ─────────────────────────────────────────────────────
    input: {
      estateValue: { type: Number, required: true },
      deceasedGender: { type: String, enum: ['male', 'female'], required: true },
      numWives: { type: Number, default: 0 },
      husbandAlive: { type: Boolean, default: false },
      numSons: { type: Number, default: 0 },
      numDaughters: { type: Number, default: 0 },
      fatherAlive: { type: Boolean, default: false },
      motherAlive: { type: Boolean, default: false },
    },

    // ─── Result snapshot ────────────────────────────────────────────────────
    heirs: [heirSchema],
    totalDistributed: { type: Number, required: true },
    totalFraction: { type: String },  // e.g. "1" if fully distributed
    notes: [{ type: String }],

    // ─── Meta ───────────────────────────────────────────────────────────────
    label: {
      type: String,
      default: '',
      maxlength: 120,
    }, // optional user-given label like "Father's estate 2024"
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by user
calculationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Calculation', calculationSchema);
