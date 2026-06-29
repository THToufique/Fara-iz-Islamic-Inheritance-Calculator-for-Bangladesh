// app/heirs/page.js
// Static page explaining Islamic heir rules, fixed shares, residuary, and blocking
// Tested: all sections render, rule cards display correctly ✓

import Link from 'next/link';

const RuleCard = ({ share, title, children }) => (
  <div className="card mb-3">
    <span className="inline-block font-mono text-xs font-semibold text-teal-deep bg-sage px-2.5 py-1 rounded-full mb-2">{share}</span>
    <h3 className="font-serif font-bold text-teal-deep mb-2">{title}</h3>
    <p className="text-sm text-ink-soft leading-relaxed">{children}</p>
  </div>
);

export default function HeirsPage() {
  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">Understanding Heir Rules</h1>
          <p className="text-ink-soft max-w-2xl">
            Three principles govern who inherits and how much: fixed Qur&apos;anic shares,
            residuary inheritance, and blocking — where the presence of one heir reduces another&apos;s entitlement.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl">

          {/* Fixed share heirs */}
          <h2 className="text-2xl font-serif font-bold text-teal-deep mb-6">Fixed-Share Heirs (Ashab al-Fara&apos;iz)</h2>
          <p className="text-ink-soft mb-6 text-sm leading-relaxed">
            These heirs receive a specific fraction set out in the Qur&apos;an (4:11–12, 4:176),
            regardless of estate size — though the exact fraction changes depending on which other heirs survive.
          </p>

          <RuleCard share="1/2 or 1/4" title="Husband">
            Receives 1/4 of the estate if the deceased wife left children or grandchildren, or 1/2 if she did not.
          </RuleCard>

          <RuleCard share="1/4 or 1/8" title="Wife (or Wives)">
            Receives 1/4 if the deceased husband left no children, or 1/8 if he did. If there is more than one wife,
            this combined share is divided equally among them.
          </RuleCard>

          <RuleCard share="1/2, 2/3, or residuary" title="Daughter(s)">
            A single daughter (with no sons) receives 1/2. Two or more daughters (with no sons) share 2/3 equally.
            If sons are also present, daughters become residuary heirs, receiving half the share of a son.
          </RuleCard>

          <RuleCard share="1/6 or 1/3" title="Mother">
            Receives 1/6 if the deceased left children. Otherwise receives 1/3. A further refinement applies
            in certain spouse-only cases (Umariyyatain) not covered in this calculator&apos;s v1.
          </RuleCard>

          <RuleCard share="1/6 or residuary" title="Father">
            Receives 1/6 if the deceased left children. If only daughters survive (no sons), the father also
            receives any residue as the nearest male relative. If no children survive, the father takes the
            entire residue after other fixed shares.
          </RuleCard>

          {/* Residuary heirs */}
          <h2 className="text-2xl font-serif font-bold text-teal-deep mb-6 mt-10">Residuary Heirs (&apos;Asabah)</h2>
          <p className="text-ink-soft mb-4 text-sm leading-relaxed">
            After fixed shares are distributed, anything remaining passes to residuary heirs —
            primarily sons, who also share the residue with daughters at a 2:1 ratio.
          </p>

          <RuleCard share="Residue, 2:1 ratio" title="Sons and Daughters together">
            When at least one son survives, daughters lose their fixed Qur&apos;anic share and instead join the sons
            in dividing the residue — each son receiving double the share of each daughter (Qur&apos;an 4:11).
          </RuleCard>

          {/* Blocking rules */}
          <h2 className="text-2xl font-serif font-bold text-teal-deep mb-6 mt-10">Blocking Rules (Hijb)</h2>
          <p className="text-ink-soft mb-4 text-sm leading-relaxed">
            The presence of certain heirs reduces — but in most common cases does not fully remove —
            the share of another.
          </p>

          <RuleCard share="Blocking example" title="Children reduce the spouse's share">
            A husband&apos;s share drops from 1/2 to 1/4, and a wife&apos;s from 1/4 to 1/8,
            whenever the deceased has surviving children.
          </RuleCard>

          <RuleCard share="Blocking example" title="Children reduce the mother's share">
            The mother&apos;s share drops from 1/3 to 1/6 whenever the deceased has surviving children.
          </RuleCard>

          {/* Out of scope note */}
          <div className="bg-sage rounded-lg p-6 mt-10">
            <h3 className="font-semibold text-teal-deep mb-2">Beyond this calculator</h3>
            <p className="text-sm text-ink-soft">
              Siblings, grandparents, grandchildren, and other relatives follow additional rules not
              implemented in this version. If the deceased has no surviving spouse, children, or parents,
              please consult a qualified Islamic scholar or one of the{' '}
              <Link href="/professionals" className="text-teal font-medium">professionals listed in our directory</Link>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
