'use client';
// app/results/page.js
// Shows calculation results with money AND land shares
// Tested: pie chart renders, land column shows correct unit and amount ✓

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculationsAPI, downloadPDF } from '../../lib/api';
import { isLoggedIn } from '../../lib/auth';

const COLORS = ['#1F4E45','#C9A227','#9FB8AE','#7A8C84','#D9C896','#3E6B60','#B68C2A','#5E7E74'];

function formatTaka(n) {
  if (!n && n !== 0) return '—';
  return '৳' + Number(n).toLocaleString('en-IN');
}

function formatLand(area, unit) {
  if (!area && area !== 0) return '—';
  const rounded = Math.round(area * 1000) / 1000;
  const unitLabel = unit === 'decimal' ? 'Dec' : unit === 'katha' ? 'Katha' : 'Bigha';
  return `${rounded} ${unitLabel}`;
}

// Convert land area to all units for display
function getLandConversions(area, unit) {
  let decimal = area;
  if (unit === 'katha') decimal = area * 1.65;
  if (unit === 'bigha') decimal = area * 33;
  const katha = decimal / 1.65;
  const bigha = decimal / 33;
  return {
    decimal: Math.round(decimal * 1000) / 1000,
    katha: Math.round(katha * 1000) / 1000,
    bigha: Math.round(bigha * 1000) / 1000,
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [input, setInput] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem('faraiz_result');
    const i = sessionStorage.getItem('faraiz_input');
    if (!r || !i) return;
    setResult(JSON.parse(r));
    setInput(JSON.parse(i));
  }, []);

  const handleSave = async () => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    setSaving(true); setSaveError('');
    try {
      await calculationsAPI.save({ input, label: '' });
      setSaved(true);
    } catch (e) { setSaveError(e.message); }
    finally { setSaving(false); }
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await downloadPDF(input); }
    catch (e) { alert('PDF generation failed: ' + e.message); }
    finally { setPdfLoading(false); }
  };

  if (!result) return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">No calculation found</h2>
      <p className="text-ink-soft mb-6">It looks like you haven&apos;t run a calculation yet.</p>
      <Link href="/calculator" className="btn-primary">Go to Calculator</Link>
    </div>
  );

  if (!result.hasResult) return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="card">
        <h2 className="text-2xl font-serif font-bold text-teal-deep mb-4">No supported heirs found</h2>
        {result.notes?.map((n, i) => <p key={i} className="text-ink-soft mb-2">{n}</p>)}
        <Link href="/calculator" className="btn-primary inline-block mt-4">Back to Calculator</Link>
      </div>
    </div>
  );

  const hasLand = input?.landArea > 0;
  const hasMoney = input?.estateValue > 0;
  const landUnit = input?.landUnit || 'decimal';
  const unitLabel = landUnit === 'decimal' ? 'Decimal' : landUnit === 'katha' ? 'Katha' : 'Bigha';

  const pieData = result.heirs.map((h, i) => ({
    name: h.name,
    value: parseFloat(h.percent),
    color: COLORS[i % COLORS.length],
  }));

  // Calculate land share per heir using same fraction
  const getLandShare = (heir) => {
    if (!hasLand) return null;
    const [num, den] = heir.fractionDisplay.includes('/')
      ? heir.fractionDisplay.split('/').map(Number)
      : [1, 1];
    const fraction = den ? num / den : parseFloat(heir.percent) / 100;
    return Math.round(input.landArea * fraction * 10000) / 10000;
  };

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-2">Calculation Results</h1>
          <p className="text-ink-soft">Based on the family details you entered, here is how the estate divides under Fara&apos;iz rules.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Summary band */}
        <div className="bg-teal rounded-lg p-8 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {hasMoney && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-cream opacity-70 mb-1">Estate Value</p>
              <p className="text-xl font-serif font-bold text-cream">{formatTaka(result.estateValue)}</p>
            </div>
          )}
          {hasLand && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-cream opacity-70 mb-1">Land Area</p>
              <p className="text-xl font-serif font-bold text-cream">{input.landArea} {unitLabel}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-cream opacity-70 mb-1">Heirs</p>
            <p className="text-xl font-serif font-bold text-cream">{result.heirs.length}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-cream opacity-70 mb-1">Distributed</p>
            <p className="text-xl font-serif font-bold text-cream">{result.totalFraction === '1' ? '100% ✓' : result.totalFraction}</p>
          </div>
        </div>

        {/* Land conversion info */}
        {hasLand && (
          <div className="bg-gold bg-opacity-10 border border-gold border-opacity-30 rounded-lg p-4 mb-6 flex flex-wrap gap-6 text-sm">
            <span className="text-ink-soft font-semibold">Total land conversions:</span>
            {(() => {
              const conv = getLandConversions(input.landArea, landUnit);
              return (
                <>
                  <span><strong className="text-teal-deep">{conv.decimal}</strong> Decimal</span>
                  <span><strong className="text-teal-deep">{conv.katha}</strong> Katha</span>
                  <span><strong className="text-teal-deep">{conv.bigha}</strong> Bigha</span>
                </>
              );
            })()}
          </div>
        )}

        {/* Chart + Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Pie chart */}
          <div className="card">
            <h3 className="font-serif font-bold text-teal-deep mb-4">Distribution Chart</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={100}
                  dataKey="value" nameKey="name">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Heir table */}
          <div className="card overflow-x-auto">
            <h3 className="font-serif font-bold text-teal-deep mb-4">Heir Breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-deep text-xs font-mono uppercase tracking-wide text-ink-soft">
                  <th className="text-left py-2 px-2">Heir</th>
                  <th className="text-left py-2 px-2">Share</th>
                  <th className="text-left py-2 px-2">Basis</th>
                  {hasMoney && <th className="text-right py-2 px-2">Money</th>}
                  {hasLand && <th className="text-right py-2 px-2">Land ({unitLabel})</th>}
                </tr>
              </thead>
              <tbody>
                {result.heirs.map((h, i) => {
                  const landShare = getLandShare(h);
                  return (
                    <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-cream'}`}>
                      <td className="py-3 px-2 font-medium">
                        {h.name}
                        <span className="block text-xs text-ink-soft font-normal">{h.role}</span>
                      </td>
                      <td className="py-3 px-2 font-mono font-semibold text-teal-deep">
                        {h.fractionDisplay}
                        <span className="block text-xs text-ink-soft font-normal">{h.percent}%</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={h.basis === 'residuary' ? 'badge-residuary' : 'badge-fixed'}>
                          {h.basis === 'residuary' ? 'Residuary' : 'Fixed'}
                        </span>
                      </td>
                      {hasMoney && (
                        <td className="py-3 px-2 font-mono text-right text-sm">{formatTaka(h.amount)}</td>
                      )}
                      {hasLand && (
                        <td className="py-3 px-2 font-mono text-right text-sm text-teal-deep font-semibold">
                          {formatLand(landShare, landUnit)}
                        </td>
                      )}
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-teal font-semibold">
                  <td colSpan={3} className="py-3 px-2">Total</td>
                  {hasMoney && (
                    <td className="py-3 px-2 font-mono text-right">{formatTaka(result.totalDistributed)}</td>
                  )}
                  {hasLand && (
                    <td className="py-3 px-2 font-mono text-right text-teal-deep">
                      {input.landArea} {unitLabel}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Land detail breakdown */}
        {hasLand && (
          <div className="card mb-8">
            <h3 className="font-serif font-bold text-teal-deep mb-4">Land Share Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-deep text-xs font-mono uppercase tracking-wide text-ink-soft">
                    <th className="text-left py-2 px-4">Heir</th>
                    <th className="text-left py-2 px-4">Fraction</th>
                    <th className="text-right py-2 px-4">Decimal</th>
                    <th className="text-right py-2 px-4">Katha</th>
                    <th className="text-right py-2 px-4">Bigha</th>
                  </tr>
                </thead>
                <tbody>
                  {result.heirs.map((h, i) => {
                    const landShare = getLandShare(h);
                    const conv = getLandConversions(landShare, landUnit);
                    return (
                      <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                        <td className="py-3 px-4 font-medium">{h.name}</td>
                        <td className="py-3 px-4 font-mono text-teal-deep">{h.fractionDisplay}</td>
                        <td className="py-3 px-4 font-mono text-right">{conv.decimal} Dec</td>
                        <td className="py-3 px-4 font-mono text-right">{conv.katha} Katha</td>
                        <td className="py-3 px-4 font-mono text-right">{conv.bigha} Bigha</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={handlePDF} disabled={pdfLoading} className="btn-primary disabled:opacity-60">
            {pdfLoading ? 'Generating...' : '⬇ Download PDF Report'}
          </button>
          <button onClick={handleSave} disabled={saving || saved} className="btn-ghost disabled:opacity-60">
            {saved ? '✓ Saved to Dashboard' : saving ? 'Saving...' : 'Save to Dashboard'}
          </button>
          <Link href="/calculator" className="btn-ghost">New Calculation</Link>
        </div>
        {saveError && <p className="text-red-600 text-sm mb-4">{saveError}</p>}
        {!isLoggedIn() && (
          <p className="text-sm text-ink-soft mb-4">
            <Link href="/login" className="text-teal font-medium">Login</Link> or{' '}
            <Link href="/register" className="text-teal font-medium">register</Link> to save your calculation.
          </p>
        )}

        {/* Start Land Registration */}
        <div className="bg-teal bg-opacity-5 border border-teal border-opacity-20 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-teal-deep mb-1">
                জমি রেজিস্ট্রার — Start Land Registration
              </h3>
              <p className="text-sm text-ink-soft">
                Ready to register the inherited land? Start the registration process to verify
                heir identities (NID), submit property documents (দলিল, খতিয়ান, খাজনা), and
                complete the submission at the Sub-Registrar office.
              </p>
            </div>
            <Link
              href={isLoggedIn() ? '/register-land' : '/login?redirect=/register-land'}
              className="btn-gold whitespace-nowrap text-center"
            >
              {isLoggedIn() ? 'জমি রেজিস্ট্রার শুরু করুন →' : 'Login to Register Land →'}
            </Link>
          </div>
        </div>

        {/* Notes */}
        {result.notes?.length > 0 && (
          <div className="bg-sage rounded-lg p-5">
            <h3 className="font-semibold text-teal-deep mb-3 text-sm">Notes on this calculation</h3>
            {result.notes.map((n, i) => (
              <p key={i} className="text-sm text-ink-soft mb-2">{n}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
