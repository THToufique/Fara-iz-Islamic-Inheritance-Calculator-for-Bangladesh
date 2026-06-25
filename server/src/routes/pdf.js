// routes/pdf.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { optionalAuth } = require('../middleware/auth');
const { calculateFaraiz } = require('../utils/faraizEngine');

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
// PDFKit's built-in standard fonts (Helvetica, etc.) only support WinAnsi
// encoding, which does NOT include the Bengali Taka sign (৳, U+09F3). Passing
// that character to a standard font doesn't just drop the glyph — it corrupts
// the encoding of the text that follows it, which is why amounts previously
// rendered as garbage ("Ÿ3RÃÃ" etc).
//
// Fix: embed a Unicode font that actually contains the glyph. Noto Sans
// Bengali also covers the full Latin range used elsewhere in the report, so
// we use it as the single font family throughout (no more font-switching
// mid-line, and no more mojibake).
//
// Place these three files at assets/fonts/ in the project root:
//   NotoSansBengali-Regular.ttf
//   NotoSansBengali-SemiBold.ttf
//   NotoSansBengali-Bold.ttf
const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts');
const FONT_REGULAR = fs.readFileSync(path.join(FONT_DIR, 'NotoSansBengali-Regular.ttf'));
const FONT_SEMIBOLD = fs.readFileSync(path.join(FONT_DIR, 'NotoSansBengali-SemiBold.ttf'));
const FONT_BOLD = fs.readFileSync(path.join(FONT_DIR, 'NotoSansBengali-Bold.ttf'));

// ---------------------------------------------------------------------------
// Palette & layout constants
// ---------------------------------------------------------------------------
const COLOR = {
  ink: '#22291F',
  green: '#1F4E45',
  greenDark: '#163832',
  gold: '#C9A227',
  goldSoft: '#E8D9A0',
  cream: '#F8F7F2',
  border: '#E3E1D8',
  gray: '#6B7268',
  grayLight: '#9AA096',
  white: '#FFFFFF',
};

const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2; // 495.28

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

// Indian/Bangladeshi digit grouping (lakh/crore), implemented manually so it
// doesn't depend on the host Node build having full ICU data for 'en-IN'.
const groupIndian = (numStr) => {
  const lastThree = numStr.slice(-3);
  const rest = numStr.slice(0, -3);
  if (!rest) return lastThree;
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
};

const formatBDT = (amount) => {
  const num = Number(amount) || 0;
  const negative = num < 0;
  const whole = Math.round(Math.abs(num)).toString();
  return `${negative ? '-' : ''}৳${groupIndian(whole)}`;
};

const formatPercent = (value) => {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
};

const formatDate = (d) =>
  d.toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function registerFonts(doc) {
  doc.registerFont('Regular', FONT_REGULAR);
  doc.registerFont('SemiBold', FONT_SEMIBOLD);
  doc.registerFont('Bold', FONT_BOLD);
}

function drawHeader(doc, label, reportRef) {
  const bandH = 96;

  // Full-bleed band (ignore page margins)
  doc.rect(0, 0, PAGE_W, bandH).fill(COLOR.green);
  doc.rect(0, bandH, PAGE_W, 3).fill(COLOR.gold);

  doc
    .font('Bold')
    .fontSize(21)
    .fillColor(COLOR.white)
    .text("Fara'iz", MARGIN, 26, { characterSpacing: 0.4 });

  doc
    .font('Regular')
    .fontSize(10.5)
    .fillColor(COLOR.goldSoft)
    .text('Islamic Inheritance Distribution Report', MARGIN, 52);

  // Meta row below the band
  const metaY = bandH + 16;
  doc
    .font('Regular')
    .fontSize(8.5)
    .fillColor(COLOR.gray)
    .text(`Reference: ${reportRef}`, MARGIN, metaY, { width: CONTENT_W / 2, align: 'left' })
    .text(`Generated ${formatDate(new Date())}`, MARGIN + CONTENT_W / 2, metaY, {
      width: CONTENT_W / 2,
      align: 'right',
    });

  if (label) {
    doc
      .font('SemiBold')
      .fontSize(9.5)
      .fillColor(COLOR.green)
      .text(label, MARGIN, metaY + 14, { width: CONTENT_W, align: 'left' });
    doc.y = metaY + 34;
  } else {
    doc.y = metaY + 20;
  }
}

function sectionTitle(doc, text) {
  const y = doc.y;
  doc.rect(MARGIN, y + 3, 4, 13).fill(COLOR.gold);
  doc
    .font('Bold')
    .fontSize(13)
    .fillColor(COLOR.green)
    .text(text, MARGIN + 12, y, { continued: false });
  doc.moveDown(0.5);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_W - MARGIN, doc.y)
    .strokeColor(COLOR.border)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.9);
}

function drawStatCard(doc, x, y, w, h, label, value) {
  doc.roundedRect(x, y, w, h, 6).fill(COLOR.cream);
  doc
    .font('SemiBold')
    .fontSize(7.7)
    .fillColor(COLOR.grayLight)
    .text(label.toUpperCase(), x + 14, y + 12, { width: w - 28, characterSpacing: 0.3 });
  doc
    .font('Bold')
    .fontSize(15.5)
    .fillColor(COLOR.green)
    .text(value, x + 14, y + 28, { width: w - 28 });
}

function drawEstateSummary(doc, result, input) {
  const totalPercent = (result.heirs || []).reduce((s, h) => s + (Number(h.percent) || 0), 0);
  const stats = [
    { label: 'Total Estate Value', value: formatBDT(result.estateValue) },
    { label: 'Heirs Identified', value: String(result.heirs.length) },
    { label: 'Deceased', value: input.deceasedGender === 'male' ? 'Male' : 'Female' },
    { label: 'Distribution', value: `${formatPercent(totalPercent)} Allocated` },
  ];

  const gap = 14;
  const boxW = (CONTENT_W - gap) / 2;
  const boxH = 56;
  const startY = doc.y;

  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (boxW + gap);
    const y = startY + row * (boxH + gap);
    drawStatCard(doc, x, y, boxW, boxH, s.label, s.value);
  });

  doc.y = startY + 2 * boxH + gap + 18;
}

function drawTableRow(doc, y, cols, colWidths, aligns, opts = {}) {
  const { isHeader = false, isAlternate = false, isTotal = false } = opts;
  const rowHeight = isHeader ? 26 : isTotal ? 24 : 21;
  const xStart = MARGIN;

  if (isHeader) {
    doc.rect(xStart, y, CONTENT_W, rowHeight).fill(COLOR.green);
  } else if (isTotal) {
    doc.rect(xStart, y, CONTENT_W, rowHeight).fill(COLOR.cream);
  } else if (isAlternate) {
    doc.rect(xStart, y, CONTENT_W, rowHeight).fill('#FBFAF6');
  }

  let x = xStart;
  doc
    .font(isHeader || isTotal ? 'SemiBold' : 'Regular')
    .fontSize(isHeader ? 9.3 : 9.2)
    .fillColor(isHeader ? COLOR.white : isTotal ? COLOR.green : COLOR.ink);

  cols.forEach((text, i) => {
    doc.text(String(text ?? '-'), x + 8, y + (isHeader ? 8.5 : 6), {
      width: colWidths[i] - 16,
      align: aligns[i],
    });
    x += colWidths[i];
  });

  doc
    .moveTo(xStart, y + rowHeight)
    .lineTo(xStart + CONTENT_W, y + rowHeight)
    .strokeColor(isHeader ? COLOR.gold : isTotal ? COLOR.gold : COLOR.border)
    .lineWidth(isHeader || isTotal ? 1.3 : 0.7)
    .stroke();

  return y + rowHeight;
}

function drawFootnotes(doc, notes) {
  if (!notes?.length) return;

  sectionTitle(doc, 'Important Notes');

  notes.forEach((note) => {
    const y = doc.y;
    doc.circle(MARGIN + 3, y + 5, 1.6).fill(COLOR.gold);
    doc
      .font('Regular')
      .fontSize(9.3)
      .fillColor(COLOR.gray)
      .text(note, MARGIN + 14, y, { width: CONTENT_W - 14, align: 'left' });
    doc.moveDown(0.5);
  });
}

function drawDisclaimer(doc) {
  doc.moveDown(1.2);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_W - MARGIN, doc.y)
    .strokeColor(COLOR.border)
    .lineWidth(0.7)
    .stroke();
  doc.moveDown(0.7);
  doc
    .font('Regular')
    .fontSize(8)
    .fillColor(COLOR.grayLight)
    .text(
      'Disclaimer: This report is generated for informational and reference purposes only. ' +
        'It is not a substitute for a formal fatwa from a qualified Islamic scholar or legal advice ' +
        'from a licensed professional. Please verify all calculations before any property division.',
      MARGIN,
      doc.y,
      { width: CONTENT_W, align: 'justify' }
    );
}

function drawFootersAndPageNumbers(doc, reportRef) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // Writing this close to the bottom edge would normally trip PDFKit's
    // automatic page-break (it inserts a *new* page if text looks like it
    // might overflow the bottom margin) — which silently appended extra
    // blank pages. Temporarily zero out the bottom margin while we draw the
    // footer so it renders in place instead of spawning new pages.
    const originalBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    const y = PAGE_H - 40;
    doc
      .moveTo(MARGIN, y - 8)
      .lineTo(PAGE_W - MARGIN, y - 8)
      .strokeColor(COLOR.border)
      .lineWidth(0.6)
      .stroke();
    doc
      .font('Regular')
      .fontSize(7.8)
      .fillColor(COLOR.grayLight)
      .text(`Fara'iz · ${reportRef}`, MARGIN, y, { width: CONTENT_W / 2, align: 'left', lineBreak: false })
      .text(`Page ${i - range.start + 1} of ${range.count}`, MARGIN + CONTENT_W / 2, y, {
        width: CONTENT_W / 2,
        align: 'right',
        lineBreak: false,
      });

    doc.page.margins.bottom = originalBottomMargin;
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { input, label } = req.body;
    if (!input) return res.status(400).json({ success: false, message: 'Input required.' });

    const result = calculateFaraiz(input);
    if (!result.hasResult || !result.heirs?.length) {
      return res.status(400).json({ success: false, message: 'No valid heirs found.' });
    }

    const reportRef = `FZ-${Date.now().toString(36).toUpperCase()}`;

    const doc = new PDFDocument({
      margin: MARGIN,
      size: 'A4',
      bufferPages: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="faraiz-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    registerFonts(doc);

    drawHeader(doc, label, reportRef);

    // ---- Estate Summary --------------------------------------------------
    sectionTitle(doc, 'Estate Summary');
    drawEstateSummary(doc, result, input);

    // ---- Heir Distribution -------------------------------------------------
    sectionTitle(doc, 'Heir Distribution');

    const colWidths = [140, 85, 70, 75, 125];
    const aligns = ['left', 'left', 'center', 'right', 'right'];
    const headers = ['Heir Name', 'Relationship', 'Fraction', 'Percentage', 'Amount (BDT)'];

    let y = doc.y;
    y = drawTableRow(doc, y, headers, colWidths, aligns, { isHeader: true });

    let totalAmount = 0;
    let totalPercent = 0;

    result.heirs.forEach((heir, i) => {
      if (y > PAGE_H - MARGIN - 130) {
        doc.addPage();
        y = MARGIN;
        y = drawTableRow(doc, y, headers, colWidths, aligns, { isHeader: true });
      }

      totalAmount += Number(heir.amount) || 0;
      totalPercent += Number(heir.percent) || 0;

      const row = [
        heir.name || 'Unnamed Heir',
        heir.role || '-',
        heir.fractionDisplay || '-',
        formatPercent(heir.percent),
        formatBDT(heir.amount),
      ];

      y = drawTableRow(doc, y, row, colWidths, aligns, { isAlternate: i % 2 === 0 });
    });

    if (y > PAGE_H - MARGIN - 100) {
      doc.addPage();
      y = MARGIN;
    }

    y = drawTableRow(
      doc,
      y,
      ['Total', '', '', formatPercent(totalPercent), formatBDT(totalAmount)],
      colWidths,
      aligns,
      { isTotal: true }
    );

    doc.y = y + 24;

    // ---- Notes & disclaimer ------------------------------------------------
    drawFootnotes(doc, result.notes);
    drawDisclaimer(doc);

    // ---- Footer / page numbers on every page --------------------------
    drawFootersAndPageNumbers(doc, reportRef);

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF.' });
    }
  }
});

module.exports = router;
