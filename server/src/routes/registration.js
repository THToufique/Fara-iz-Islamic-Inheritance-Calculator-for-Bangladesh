const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const Registration = require('../models/Registration');

// ─── Verify a single document ─────────────────────────────────────────────
// POST /api/registration/verify-document
router.post('/verify-document', protect, [
  body('docType').isIn(['nid', 'dolil', 'khatian', 'khajana']).withMessage('Invalid document type'),
  body('docNumber').trim().notEmpty().withMessage('Document number is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { docType, docNumber } = req.body;

    const doc = await Document.findOne({
      docType,
      docNumber: docNumber.trim(),
      isActive: true,
    });

    if (!doc) {
      return res.json({
        success: true,
        verified: false,
        message: `${docType.toUpperCase()} number "${docNumber}" not found in database`,
      });
    }

    res.json({
      success: true,
      verified: true,
      document: {
        docNumber: doc.docNumber,
        docType: doc.docType,
        holderName: doc.holderName,
        holderNameBn: doc.holderNameBn,
        fatherName: doc.fatherName,
        motherName: doc.motherName,
        district: doc.district,
        upazila: doc.upazila,
        landInfo: doc.landInfo,
        issueDate: doc.issueDate,
      },
    });
  } catch (err) {
    console.error('Document verification error:', err);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

// ─── Verify multiple heir NIDs at once ────────────────────────────────────
// POST /api/registration/verify-heirs
router.post('/verify-heirs', protect, [
  body('heirs').isArray({ min: 1 }).withMessage('At least one heir is required'),
  body('heirs.*.nidNumber').trim().notEmpty().withMessage('NID number is required for each heir'),
  body('heirs.*.name').trim().notEmpty().withMessage('Name is required for each heir'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { heirs } = req.body;
    const results = [];

    for (const heir of heirs) {
      const doc = await Document.findOne({
        docType: 'nid',
        docNumber: heir.nidNumber.trim(),
        isActive: true,
      });

      results.push({
        name: heir.name,
        role: heir.role || '',
        nidNumber: heir.nidNumber,
        verified: !!doc,
        matchedName: doc ? doc.holderName : null,
        matchedNameBn: doc ? doc.holderNameBn : null,
        shareFraction: heir.shareFraction || '',
        sharePercent: heir.sharePercent || '',
        shareAmount: heir.shareAmount || 0,
        landShareArea: heir.landShareArea || 0,
        landShareUnit: heir.landShareUnit || 'decimal',
      });
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Heir verification error:', err);
    res.status(500).json({ success: false, message: 'Server error during heir verification' });
  }
});

// ─── Create a new registration ────────────────────────────────────────────
// POST /api/registration
router.post('/', protect, [
  body('heirs').isArray({ min: 1 }).withMessage('At least one heir is required'),
  body('propertyDocuments.dolilNumber').trim().notEmpty().withMessage('Dolil number is required'),
  body('propertyDocuments.khatianNumber').trim().notEmpty().withMessage('Khatian number is required'),
  body('propertyDocuments.khajanaNumber').trim().notEmpty().withMessage('Khajana number is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      calculationId,
      heirs,
      propertyDocuments,
      property,
      estateValue,
      totalDistributed,
      registrationOffice,
    } = req.body;

    // Verify all heir NIDs
    const verifiedHeirs = [];
    for (const heir of heirs) {
      const doc = await Document.findOne({
        docType: 'nid',
        docNumber: heir.nidNumber.trim(),
        isActive: true,
      });
      verifiedHeirs.push({
        ...heir,
        nidVerified: !!doc,
      });
    }

    // Verify property documents
    const dolilDoc = await Document.findOne({
      docType: 'dolil',
      docNumber: propertyDocuments.dolilNumber.trim(),
      isActive: true,
    });
    const khatianDoc = await Document.findOne({
      docType: 'khatian',
      docNumber: propertyDocuments.khatianNumber.trim(),
      isActive: true,
    });
    const khajanaDoc = await Document.findOne({
      docType: 'khajana',
      docNumber: propertyDocuments.khajanaNumber.trim(),
      isActive: true,
    });

    const allHeirsVerified = verifiedHeirs.every(h => h.nidVerified);
    const allDocsVerified = !!(dolilDoc && khatianDoc && khajanaDoc);

    let status = 'draft';
    if (allHeirsVerified && allDocsVerified) {
      status = 'pending';
    }

    const registration = await Registration.create({
      user: req.user._id,
      calculation: calculationId || null,
      status,
      heirs: verifiedHeirs,
      propertyDocuments: {
        dolilNumber: propertyDocuments.dolilNumber,
        dolilVerified: !!dolilDoc,
        khatianNumber: propertyDocuments.khatianNumber,
        khatianVerified: !!khatianDoc,
        khajanaNumber: propertyDocuments.khajanaNumber,
        khajanaVerified: !!khajanaDoc,
      },
      property: property || {},
      estateValue: estateValue || 0,
      totalDistributed: totalDistributed || 0,
      registrationOffice: registrationOffice || {},
      submittedAt: status === 'pending' ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      registration,
      verification: {
        allHeirsVerified,
        allDocsVerified,
        heirResults: verifiedHeirs.map(h => ({
          name: h.name,
          nidNumber: h.nidNumber,
          verified: h.nidVerified,
        })),
        documentResults: {
          dolil: { number: propertyDocuments.dolilNumber, verified: !!dolilDoc },
          khatian: { number: propertyDocuments.khatianNumber, verified: !!khatianDoc },
          khajana: { number: propertyDocuments.khajanaNumber, verified: !!khajanaDoc },
        },
      },
    });
  } catch (err) {
    console.error('Registration creation error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─── Get user's registrations ─────────────────────────────────────────────
// GET /api/registration
router.get('/', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Get single registration ──────────────────────────────────────────────
// GET /api/registration/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Get dummy document list (for reference/testing) ──────────────────────
// GET /api/registration/documents/list
router.get('/documents/list', protect, async (req, res) => {
  try {
    const { docType } = req.query;
    const filter = { isActive: true };
    if (docType) filter.docType = docType;

    const docs = await Document.find(filter)
      .select('docType docNumber holderName holderNameBn district upazila landInfo issueDate')
      .sort({ docType: 1, docNumber: 1 });

    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
