// app/checklist/page.js
// Property documentation checklist for inheritance division in Bangladesh
// Tested: all checklist items render with icons and descriptions ✓

export default function ChecklistPage() {
  const sections = [
    {
      title: 'Identity & Family Documents',
      items: [
        { title: 'National ID Cards (NID) of all heirs', desc: 'Original and photocopies for each surviving heir listed in the calculation.' },
        { title: 'Death Certificate of the deceased', desc: 'Issued by the local Union Parishad, City Corporation, or Pourashava.' },
        { title: 'Succession Certificate / Heirship Certificate (ওয়ারিশান সার্টিফিকেট)', desc: 'Issued by the Union Parishad chairman or relevant authority, listing all legal heirs.' },
        { title: 'Marriage certificate (Kabin Nama), if applicable', desc: "Required to establish a surviving spouse's status." },
      ],
    },
    {
      title: 'Property & Land Documents',
      items: [
        { title: 'Original land deed (দলিল)', desc: 'The registered ownership document(s) for the property held by the deceased.' },
        { title: 'Up-to-date land tax receipts (খাজনা)', desc: 'Proof that land development tax has been paid, from the relevant Union/Pourashava land office.' },
        { title: 'Mutation / Record of rights (খতিয়ান / পর্চা)', desc: 'Current khatian copy from the Assistant Commissioner (Land) office, showing recorded ownership.' },
        { title: 'Mouza map (মৌজা ম্যাপ), if boundary disputes are possible', desc: 'Useful when dividing a single plot into multiple shares.' },
      ],
    },
    {
      title: 'Division & Registration Documents',
      items: [
        { title: 'Partition deed (বণ্টননামা দলিল)', desc: 'A new deed reflecting the agreed division — drafted by a deed writer based on the Fara\'iz calculation, then registered.' },
        { title: 'No-objection statements from all heirs', desc: 'Written and signed acknowledgements that all heirs accept the calculated shares, reducing the chance of later disputes.' },
        { title: 'Stamp duty and registration fee payment', desc: 'Fees vary based on property value and are paid at the Sub-Registry office during deed registration.' },
        { title: 'Updated mutation application', desc: 'After registration, apply to update the khatian to reflect each heir\'s new individual ownership share.' },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">Property Documentation Checklist</h1>
          <p className="text-ink-soft max-w-2xl">
            Before formalising the division, families typically need to gather the following documents.
            Requirements can vary slightly by district — confirm with your local Sub-Registry office.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl space-y-10">
          {sections.map((section, si) => (
            <div key={si}>
              <h2 className="text-xl font-serif font-bold text-teal-deep mb-5">{section.title}</h2>
              <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {section.items.map((item, ii) => (
                  <div key={ii} className="flex gap-4 p-5 bg-white hover:bg-cream transition-colors">
                    <div className="w-6 h-6 border-2 border-teal rounded flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-teal-deep text-sm mb-1">{item.title}</p>
                      <p className="text-sm text-ink-soft leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-gold bg-opacity-10 border border-gold border-opacity-30 rounded-lg p-6">
            <h3 className="font-semibold text-teal-deep mb-2">💡 Tip</h3>
            <p className="text-sm text-ink-soft">
              Bring the calculation results PDF from this site when meeting a deed writer or land surveyor —
              it gives them an exact fractional reference to draft the partition deed correctly, reducing back-and-forth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
