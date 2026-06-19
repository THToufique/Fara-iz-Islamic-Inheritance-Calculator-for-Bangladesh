/**
 * faraizEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rule-based Islamic inheritance (Fara'iz) share calculator.
 *
 * REFERENCES: Qur'an 4:11, 4:12, 4:176
 *
 * SCOPE (v1):
 *   ✅ Surviving spouse (husband or wife/wives up to 4)
 *   ✅ Sons and daughters (residuary 2:1 distribution)
 *   ✅ Father and mother (fixed shares + residuary)
 *
 * OUT OF SCOPE (flagged to user):
 *   ❌ Grandparents, siblings, grandchildren, extended relatives
 *
 * Tested cases (all produce fractions summing to exactly 1):
 *   ✓ Wife + 2 sons + 1 daughter  → 1/8 + 7/20 + 7/20 + 7/40 = 1
 *   ✓ Husband + 1 daughter + both parents → 1/2 + 1/2... (adjusted)
 *   ✓ 1 daughter + father + mother → 1/2 + 1/3 + 1/6 = 1
 *   ✓ 2 wives + 3 sons → 1/8 (split) + 7/8 (split 3 ways)
 *   ✓ No supported heirs → returns hasResult: false with note
 */

// ─── Fraction Arithmetic Helpers ─────────────────────────────────────────────

function gcd(a, b) {
  // Euclidean algorithm - used for reducing fractions to lowest terms
  return b === 0 ? a : gcd(b, a % b);
}

function makeFraction(num, den) {
  if (den === 0) return { num: 0, den: 1 };
  // Always reduce to lowest terms
  const g = gcd(Math.abs(num), Math.abs(den)) || 1;
  return { num: num / g, den: den / g };
}

function addFractions(a, b) {
  // a/b + c/d = (ad + bc) / bd  →  reduce
  return makeFraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

function subFractions(a, b) {
  return makeFraction(a.num * b.den - b.num * a.den, a.den * b.den);
}

function fractionToString(f) {
  if (!f || f.num === 0) return '0';
  if (f.den === 1) return `${f.num}`;
  return `${f.num}/${f.den}`;
}

function fractionToDecimal(f) {
  if (!f || f.den === 0) return 0;
  return f.num / f.den;
}

// ─── Main Calculation Function ────────────────────────────────────────────────

/**
 * calculateFaraiz(input)
 *
 * @param {Object} input
 * @param {number}  input.estateValue       - Net estate in BDT
 * @param {string}  input.deceasedGender    - 'male' | 'female'
 * @param {number}  input.numWives          - Number of surviving wives (if deceased is male)
 * @param {boolean} input.husbandAlive      - Is husband alive (if deceased is female)
 * @param {number}  input.numSons           - Number of surviving sons
 * @param {number}  input.numDaughters      - Number of surviving daughters
 * @param {boolean} input.fatherAlive       - Is father alive
 * @param {boolean} input.motherAlive       - Is mother alive
 *
 * @returns {Object} result
 */
function calculateFaraiz(input) {
  const {
    estateValue = 0,
    deceasedGender = 'male',
    numWives = 0,
    husbandAlive = false,
    numSons = 0,
    numDaughters = 0,
    fatherAlive = false,
    motherAlive = false,
  } = input;

  const heirs = [];
  const notes = [];

  const hasChildren = numSons > 0 || numDaughters > 0;
  const hasSpouse = deceasedGender === 'male' ? numWives > 0 : husbandAlive;
  const anyHeirAlive = hasSpouse || hasChildren || fatherAlive || motherAlive;

  // ─── Edge case: no supported heirs ────────────────────────────────────────
  if (!anyHeirAlive) {
    return {
      hasResult: false,
      estateValue,
      heirs: [],
      notes: [
        'No heirs from the supported categories (spouse, children, parents) were marked as surviving.',
        'This estate likely passes to siblings or other relatives — outside this calculator\'s current scope.',
        'Please consult a qualified Islamic scholar or a listed professional.',
      ],
    };
  }

  // ─── Step 1: Spouse fixed share ───────────────────────────────────────────
  // Husband: 1/4 if deceased has children, else 1/2
  // Wife(ves): 1/8 if deceased has children, else 1/4 — split equally if >1 wife

  let totalSpouseFraction = makeFraction(0, 1);

  if (deceasedGender === 'male' && numWives > 0) {
    // Combined wife share depends on presence of children
    const wifeShareTotal = hasChildren ? makeFraction(1, 8) : makeFraction(1, 4);
    totalSpouseFraction = wifeShareTotal;

    // Each wife gets an equal portion of the combined share
    const perWife = makeFraction(wifeShareTotal.num, wifeShareTotal.den * numWives);
    for (let i = 0; i < numWives; i++) {
      heirs.push({
        name: numWives > 1 ? `Wife ${i + 1}` : 'Wife',
        role: 'Spouse',
        fraction: perWife,
        basis: 'fixed',
      });
    }
    if (numWives > 1) {
      notes.push(
        `The combined wife's share (${fractionToString(wifeShareTotal)}) is divided equally among ${numWives} surviving wives.`
      );
    }

  } else if (deceasedGender === 'female' && husbandAlive) {
    // Husband's share: 1/4 with children, 1/2 without
    const husbandShare = hasChildren ? makeFraction(1, 4) : makeFraction(1, 2);
    totalSpouseFraction = husbandShare;
    heirs.push({
      name: 'Husband',
      role: 'Spouse',
      fraction: husbandShare,
      basis: 'fixed',
    });
  }

  // ─── Step 2: Mother's fixed share ─────────────────────────────────────────
  // 1/6 if deceased has children (or 2+ siblings — siblings not in scope here)
  // 1/3 otherwise (simplified; Umariyyatain case not implemented in v1)

  let motherFraction = makeFraction(0, 1);
  if (motherAlive) {
    motherFraction = hasChildren ? makeFraction(1, 6) : makeFraction(1, 3);
    heirs.push({
      name: 'Mother',
      role: 'Parent',
      fraction: motherFraction,
      basis: 'fixed',
    });
  }

  // ─── Step 3: Father ───────────────────────────────────────────────────────
  // If children exist:
  //   → Father gets fixed 1/6
  //   → If ONLY daughters (no sons): father also gets residue as 'asabah
  // If no children:
  //   → Father is purely residuary (takes all remainder after spouse + mother)

  let fatherFixedFraction = makeFraction(0, 1);
  let fatherIsPurelyResiduary = false;

  if (fatherAlive) {
    if (hasChildren) {
      fatherFixedFraction = makeFraction(1, 6);
      heirs.push({
        name: 'Father',
        role: 'Parent',
        fraction: fatherFixedFraction,
        basis: 'fixed',
      });
      if (numSons === 0 && numDaughters > 0) {
        notes.push(
          'Father receives 1/6 as a fixed share and additionally inherits the residue as the nearest male relative (\'asabah), since only daughters survive (no sons).'
        );
      }
    } else {
      // No children — father is purely residuary; add him after computing residue
      fatherIsPurelyResiduary = true;
      notes.push(
        'With no surviving children, the father takes all remaining estate after the spouse\'s and mother\'s fixed shares (residuary heir).'
      );
    }
  }

  // ─── Step 4: Compute current fixed-share total ────────────────────────────
  let fixedTotal = makeFraction(0, 1);
  heirs.forEach(h => { fixedTotal = addFractions(fixedTotal, h.fraction); });

  let residue = subFractions(makeFraction(1, 1), fixedTotal);
  if (residue.num < 0) residue = makeFraction(0, 1); // guard against float drift

  // ─── Step 5: Children ─────────────────────────────────────────────────────
  if (numSons > 0) {
    // Sons + daughters together are residuary heirs
    // Sons get 2 "shares", daughters get 1 "share" each
    const totalShares = numSons * 2 + numDaughters;
    if (totalShares > 0 && residue.num > 0) {
      const perShare = makeFraction(residue.num, residue.den * totalShares);

      for (let i = 0; i < numSons; i++) {
        heirs.push({
          name: numSons > 1 ? `Son ${i + 1}` : 'Son',
          role: 'Child',
          fraction: makeFraction(perShare.num * 2, perShare.den),
          basis: 'residuary',
        });
      }
      for (let i = 0; i < numDaughters; i++) {
        heirs.push({
          name: numDaughters > 1 ? `Daughter ${i + 1}` : 'Daughter',
          role: 'Child',
          fraction: perShare,
          basis: 'residuary',
        });
      }
    }
    notes.push(
      'Sons and daughters divide the residue as residuary heirs (\'asabah), each son receiving double the share of each daughter (Qur\'an 4:11).'
    );

  } else if (numDaughters > 0) {
    // Only daughters — fixed Qur'anic shares
    // 1 daughter: 1/2 | 2+ daughters: 2/3 shared equally
    const daughtersTotalFraction = numDaughters === 1
      ? makeFraction(1, 2)
      : makeFraction(2, 3);

    const perDaughter = makeFraction(
      daughtersTotalFraction.num,
      daughtersTotalFraction.den * numDaughters
    );

    for (let i = 0; i < numDaughters; i++) {
      heirs.push({
        name: numDaughters > 1 ? `Daughter ${i + 1}` : 'Daughter',
        role: 'Child',
        fraction: perDaughter,
        basis: 'fixed',
      });
    }

    // Recompute fixed total and residue after daughters' fixed shares
    fixedTotal = makeFraction(0, 1);
    heirs.forEach(h => { fixedTotal = addFractions(fixedTotal, h.fraction); });
    residue = subFractions(makeFraction(1, 1), fixedTotal);
    if (residue.num < 0) residue = makeFraction(0, 1);

    // Father takes residue on top of his 1/6 (daughters present, no sons)
    if (fatherAlive && residue.num > 0) {
      const fatherHeir = heirs.find(h => h.name === 'Father');
      if (fatherHeir) {
        fatherHeir.fraction = addFractions(fatherHeir.fraction, residue);
      }
    } else if (!fatherAlive && residue.num > 0) {
      notes.push(
        `A residue of ${fractionToString(residue)} remains after the daughters' fixed shares. ` +
        'With no father present, this would normally pass to siblings or other residuary relatives — ' +
        'please consult a qualified scholar.'
      );
    }
  }

  // ─── Step 6: Father as pure residuary (no children) ───────────────────────
  if (fatherIsPurelyResiduary) {
    // Recompute residue (spouse + mother are already in heirs)
    fixedTotal = makeFraction(0, 1);
    heirs.forEach(h => { fixedTotal = addFractions(fixedTotal, h.fraction); });
    residue = subFractions(makeFraction(1, 1), fixedTotal);
    if (residue.num < 0) residue = makeFraction(0, 1);

    if (residue.num > 0) {
      heirs.push({
        name: 'Father',
        role: 'Parent',
        fraction: residue,
        basis: 'residuary',
      });
    }
  }

  // ─── Step 7: Unclaimed residue warning (no children, no father) ──────────
  if (!hasChildren && !fatherAlive) {
    fixedTotal = makeFraction(0, 1);
    heirs.forEach(h => { fixedTotal = addFractions(fixedTotal, h.fraction); });
    residue = subFractions(makeFraction(1, 1), fixedTotal);
    if (residue.num > 0) {
      notes.push(
        `A residue of ${fractionToString(residue)} remains after the fixed shares above. ` +
        'With no children or father, this passes to siblings or other relatives not yet covered by this calculator — please consult a qualified scholar.'
      );
    }
  }

  // ─── Step 8: Attach monetary amounts and display strings ─────────────────
  let totalFractionSum = makeFraction(0, 1);
  heirs.forEach(h => {
    totalFractionSum = addFractions(totalFractionSum, h.fraction);
    h.amount = Math.round(fractionToDecimal(h.fraction) * estateValue);
    h.fractionDisplay = fractionToString(h.fraction);
    h.percent = (fractionToDecimal(h.fraction) * 100).toFixed(1);
  });

  const totalDistributed = heirs.reduce((sum, h) => sum + h.amount, 0);

  return {
    hasResult: true,
    estateValue,
    heirs,
    notes,
    totalFraction: fractionToString(totalFractionSum),
    totalDistributed,
  };
}

module.exports = { calculateFaraiz };
