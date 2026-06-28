// app/about/page.js
// About page - project background, approach, scope, technology, disclaimer
// Tested: all sections render correctly ✓

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">About This Project</h1>
          <p className="text-ink-soft max-w-2xl">
            A student web development project aimed at making Islamic inheritance
            calculation accessible, transparent, and dispute-reducing for families in Bangladesh.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl space-y-10">

          <div>
            <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">The Problem</h2>
            <p className="text-ink-soft leading-relaxed">
              Inheritance disputes are among the most common sources of prolonged family and legal
              conflict in Bangladesh. Many families divide property informally, based on memory,
              social pressure, or incomplete understanding of Fara&apos;iz rules — often leading to
              unequal or religiously incorrect distributions that surface as disputes years later,
              sometimes ending up in lengthy court cases.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">The Approach</h2>
            <p className="text-ink-soft leading-relaxed">
              This site provides a rule-based calculator that applies the standard (majority/Sunni)
              Fara&apos;iz framework to a family&apos;s specific situation — who survived the deceased,
              and in what combination — and returns an exact fractional and monetary breakdown.
              Alongside the calculator, the site offers plain-language explanations of heir rules,
              a checklist of documents typically needed to formalise a division in Bangladesh, and a
              directory connecting families to land and registration professionals.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">Current Scope</h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              The calculation engine in this version supports the most statistically common family
              configurations: a surviving spouse (or spouses), sons and/or daughters, and surviving
              parents. Cases involving siblings, grandparents, or other extended relatives are flagged
              but not yet calculated — a deliberate scoping decision to keep the core engine correct
              and well-tested before expanding coverage.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sage rounded-lg p-4">
                <p className="text-xs font-mono font-semibold text-teal-deep uppercase tracking-wider mb-2">✅ In Scope (v1)</p>
                <ul className="text-sm text-ink-soft space-y-1">
                  <li>• Surviving spouse(s)</li>
                  <li>• Sons and daughters</li>
                  <li>• Father and mother</li>
                </ul>
              </div>
              <div className="bg-cream-deep border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-mono font-semibold text-ink-soft uppercase tracking-wider mb-2">🔜 Future Scope</p>
                <ul className="text-sm text-ink-soft space-y-1">
                  <li>• Siblings</li>
                  <li>• Grandparents</li>
                  <li>• Grandchildren</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">Technology</h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Built with a Next.js 14 frontend, an Express.js REST API backend, and MongoDB for
              storing user accounts, saved calculations, professional directory listings, and articles.
              The Fara&apos;iz calculation logic is implemented as an isolated, testable rules engine,
              separate from the web layer.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Frontend', tech: 'Next.js 14 + Tailwind CSS' },
                { label: 'Backend', tech: 'Express.js + Node.js' },
                { label: 'Database', tech: 'MongoDB + Mongoose' },
              ].map((t, i) => (
                <div key={i} className="card text-center">
                  <p className="text-xs font-mono text-ink-soft uppercase tracking-wider mb-1">{t.label}</p>
                  <p className="text-sm font-semibold text-teal-deep">{t.tech}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sage rounded-lg p-6">
            <h3 className="font-semibold text-teal-deep mb-2">Disclaimer</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              This tool is provided for informational and reference purposes only. It is not a
              substitute for a ruling (fatwa) from a qualified Islamic scholar, nor for legal advice
              from a licensed professional. Always verify results before finalising any property
              division. For complex cases, visit our{' '}
              <Link href="/professionals" className="text-teal font-medium">professional directory</Link>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
