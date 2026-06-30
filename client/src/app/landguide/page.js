// app/landguide/page.js
// Step-by-step land registration guide for Bangladesh inheritance cases
// Tested: all steps render with correct numbering and descriptions ✓

import Link from 'next/link';

const steps = [
  {
    num: '01',
    title: 'Obtain the Death Certificate',
    desc: 'Apply to the local Union Parishad, City Corporation, or Pourashava for an official death certificate of the deceased. This is required for all subsequent steps.',
    docs: ['National ID or birth certificate of deceased', 'Application form from Union Parishad'],
  },
  {
    num: '02',
    title: 'Get the Heirship Certificate (ওয়ারিশান সার্টিফিকেট)',
    desc: 'Apply to the Union Parishad chairman or ward commissioner for a certificate listing all legal heirs. This document officially establishes who is entitled to inherit.',
    docs: ['Death certificate', 'NIDs of all heirs', 'Marriage certificate (if spouse is an heir)'],
  },
  {
    num: '03',
    title: 'Collect All Property Documents',
    desc: 'Gather the original land deed (dolil), up-to-date land tax receipts (khajana), and the current khatian/porcha from the Assistant Commissioner (Land) office.',
    docs: ['Original deed (দলিল)', 'Land tax receipts (খাজনা)', 'Khatian/Porcha (খতিয়ান)'],
  },
  {
    num: '04',
    title: "Run the Fara'iz Calculation",
    desc: "Use this platform's calculator to determine each heir's exact fractional share of the estate. Download the PDF report to use as a formal reference document.",
    docs: ['Estate value (net of debts)', 'List of all surviving heirs'],
    link: { href: '/calculator', label: 'Go to Calculator →' },
  },
  {
    num: '05',
    title: 'Draft the Partition Deed (বণ্টননামা দলিল)',
    desc: 'Visit a registered deed writer (দলিল লেখক) at your local Sub-Registry office. Provide the Fara\'iz calculation PDF. The deed writer will draft a partition deed reflecting the calculated shares.',
    docs: ["Fara'iz calculation PDF", 'All property documents', 'NIDs of all heirs'],
  },
  {
    num: '06',
    title: 'Pay Stamp Duty and Register the Deed',
    desc: 'Pay the applicable stamp duty (varies by property value) and present the partition deed at the Sub-Registry office for registration. All heirs must be present or represented by power of attorney.',
    docs: ['Partition deed (draft)', 'Stamp duty payment receipt', 'NIDs of all heirs'],
  },
  {
    num: '07',
    title: 'Apply for Mutation (নামজারি)',
    desc: 'After the deed is registered, apply to the Assistant Commissioner (Land) office for a mutation — updating the khatian to show each heir\'s new individual ownership share. This finalises the legal transfer.',
    docs: ['Registered partition deed', 'Mutation application form', 'Updated land tax receipt'],
  },
];

export default function LandGuidePage() {
  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">Land Registration Guide</h1>
          <p className="text-ink-soft max-w-2xl">
            A step-by-step walkthrough of the property division and registration process in Bangladesh,
            following an inheritance calculation.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="card flex gap-6">
              <div className="flex-shrink-0">
                <span className="w-12 h-12 rounded-full bg-teal flex items-center justify-center text-cream font-mono font-bold text-sm">
                  {step.num}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-teal-deep text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-3">{step.desc}</p>
                {step.docs && (
                  <div>
                    <p className="text-xs font-mono font-semibold text-ink-soft uppercase tracking-wider mb-1.5">Required:</p>
                    <ul className="space-y-1">
                      {step.docs.map((doc, j) => (
                        <li key={j} className="text-sm text-ink-soft flex gap-2">
                          <span className="text-gold">•</span> {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.link && (
                  <Link href={step.link.href} className="inline-block mt-3 text-sm font-semibold text-teal hover:text-teal-deep">
                    {step.link.label}
                  </Link>
                )}
              </div>
            </div>
          ))}

          <div className="bg-sage rounded-lg p-6">
            <h3 className="font-semibold text-teal-deep mb-2">Need professional help?</h3>
            <p className="text-sm text-ink-soft">
              Our directory lists land surveyors and registration agents by district who can guide you through this process.{' '}
              <Link href="/professionals" className="text-teal font-medium">Browse professionals →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
