// app/faq/page.js
// FAQ and Glossary static page
// Tested: all FAQ items and glossary terms render correctly ✓

const faqs = [
  {
    q: "Is this calculator a substitute for a scholar's ruling?",
    a: "No. This tool provides a reference calculation based on the standard majority (Sunni) rules for common family configurations. For legal or religious finality — especially in complex families — consult a qualified Islamic scholar (mufti) or one of the listed professionals.",
  },
  {
    q: "What estate value should I enter?",
    a: "Enter the net value of the estate — meaning total assets minus outstanding debts, funeral expenses, and any valid bequest (wasiyyah, limited to at most 1/3 of the estate to non-heirs). The calculator does not automatically subtract these.",
  },
  {
    q: "What if the deceased had siblings but no children or parents?",
    a: "This version of the calculator does not yet handle sibling inheritance. If siblings are the closest surviving relatives, please consult a scholar. The calculator will indicate this case but cannot compute the distribution.",
  },
  {
    q: "Why does a son get double the share of a daughter?",
    a: "This ratio is established in the Qur'an (4:11) as part of the fixed inheritance framework. Many scholars note this reflects differing financial responsibilities under Islamic law, including mahr and maintenance obligations. This calculator applies the ratio as specified.",
  },
  {
    q: "Can I save my calculation and come back later?",
    a: "Yes — create a free account from the register page. Your results will be saved to your dashboard along with a downloadable PDF report.",
  },
  {
    q: "Does this calculator account for a will (wasiyyah)?",
    a: "Not directly. If the deceased left a valid Islamic will bequeathing up to 1/3 of the estate to a non-heir, deduct that portion before entering the remaining value into the calculator.",
  },
];

const glossary = [
  { term: "Fara'iz (فرائض)", def: "The Islamic system of fixed inheritance shares prescribed primarily in the Qur'an, determining how an estate is divided among surviving relatives." },
  { term: "Wasiyyah (وصية)", def: "An Islamic will, through which a person may bequeath up to one-third of their estate to someone who is not already a Qur'anic heir." },
  { term: "'Asabah (عصبة)", def: "Residuary heirs — typically male relatives — who inherit whatever remains of the estate after fixed shares have been distributed." },
  { term: "Hijb (حجب)", def: "Blocking — the rule by which the presence of a closer relative reduces or removes the inheritance share of a more distant one." },
  { term: "Khatian / Porcha (খতিয়ান / পর্চা)", def: "The official record of land ownership maintained by Bangladesh's land administration, used to verify and update property ownership." },
  { term: "Dolil (দলিল)", def: "A registered legal deed, most commonly referring to a land transfer or ownership document in Bangladesh." },
  { term: "Ozarishan Certificate (ওয়ারিশান সার্টিফিকেট)", def: "An heirship certificate issued by local government (Union Parishad), listing all legal heirs of a deceased person — required for inheritance and bank account transfers." },
  { term: "Bonton Nama (বণ্টননামা)", def: "A partition deed — the legal document that formally divides jointly-owned property among heirs according to their agreed or calculated shares." },
];

export default function FAQPage() {
  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">FAQ &amp; Glossary</h1>
          <p className="text-ink-soft max-w-2xl">Common questions about how this calculator works, and key Arabic and Bangla terms used throughout the site.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl">
          {/* FAQ */}
          <h2 className="text-2xl font-serif font-bold text-teal-deep mb-6">Frequently Asked Questions</h2>
          <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-14">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-white">
                <h3 className="font-serif font-bold text-teal-deep mb-2">{faq.q}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Glossary */}
          <h2 className="text-2xl font-serif font-bold text-teal-deep mb-6">Glossary of Terms</h2>
          <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {glossary.map((g, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-5 bg-white">
                <dt className="font-serif font-bold text-teal-deep text-sm">{g.term}</dt>
                <dd className="sm:col-span-2 text-sm text-ink-soft leading-relaxed">{g.def}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
