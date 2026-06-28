// app/page.js
// Home/landing page - hero, 3-step strip, info cards
// Tested: renders correctly, CTA buttons navigate to calculator ✓

import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <div>
              <p className="eyebrow">Estate &amp; Inheritance Guidance — Bangladesh</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-teal-deep leading-tight mb-6">
                Every estate divides into shares.<br />
                Know yours before disputes do.
              </h1>
              <p className="text-ink-soft text-lg mb-8 leading-relaxed max-w-lg">
                Fara&apos;iz applies the fixed inheritance shares of Islamic law (Qur&apos;an 4:11–12)
                to your family&apos;s situation — spouse, children, and parents — and shows exactly
                who receives what, in clear fractions and taka.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/calculator" className="btn-primary">
                  Start a Calculation
                </Link>
                <Link href="/heirs" className="btn-ghost">
                  Understand Heir Rules
                </Link>
              </div>
              <p className="mt-4 text-xs font-mono text-ink-soft">
                Free · No login required · Results can be saved to an account
              </p>
            </div>

            {/* Visual card */}
            <div className="card text-center">
              <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#E2DDD0" strokeWidth="2"/>
                <path d="M100,100 L100,10 A90,90 0 0,1 178,145 Z" fill="#1F4E45"/>
                <path d="M100,100 L178,145 A90,90 0 0,1 22,145 Z" fill="#C9A227"/>
                <path d="M100,100 L22,145 A90,90 0 0,1 100,10 Z" fill="#9FB8AE"/>
                <circle cx="100" cy="100" r="32" fill="white"/>
              </svg>
              <div className="space-y-2 text-left max-w-xs mx-auto">
                {[
                  { color: 'bg-teal', label: 'Sons — 2 shares each' },
                  { color: 'bg-gold', label: 'Wife — 1/8 share' },
                  { color: 'bg-sage border border-gray-300', label: 'Daughters — 1 share each' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-ink-soft">
                    <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.color}`} />
                    {item.label}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-soft italic">
                Sample distribution — every family&apos;s case differs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3-Step Strip ─────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { num: '01', title: 'Enter your family', desc: 'Spouse, children, and living parents — the cases that govern most estates in Bangladesh.' },
              { num: '02', title: 'Get exact fractions', desc: "The calculator applies Qur'anic share rules and residuary distribution automatically." },
              { num: '03', title: 'Plan the paperwork', desc: 'Follow our document checklist and land registration guide to formalise the division.' },
            ].map((step) => (
              <div key={step.num}>
                <span className="text-sm font-mono font-semibold text-gold">{step.num}</span>
                <h3 className="text-xl font-serif font-bold text-teal-deep mt-2 mb-3">{step.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Info Cards ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Why families need this',
                desc: 'Land disputes in Bangladesh frequently stem from informal or incorrect division of inheritance. A clear, rule-based calculation gives every heir a documented reference point before registration begins.',
              },
              {
                title: 'What this tool covers',
                desc: "The calculation engine handles the most common configurations — surviving spouse(s), sons, daughters, and parents. Cases involving siblings or extended family are noted as future scope.",
              },
              {
                title: 'Find professional help',
                desc: "Once shares are calculated, connect with land surveyors and registration professionals listed by district to move the paperwork forward.",
                link: { href: '/professionals', label: 'Browse Professionals →' },
              },
            ].map((card, i) => (
              <div key={i} className="bg-sage rounded-lg p-7">
                <h3 className="font-serif font-bold text-teal-deep mb-3">{card.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{card.desc}</p>
                {card.link && (
                  <Link href={card.link.href} className="inline-block mt-4 text-sm font-semibold text-teal hover:text-teal-deep">
                    {card.link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
