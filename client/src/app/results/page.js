'use client';
// app/results/page.js
// Shows calculation results from sessionStorage with pie chart and heir table
// Tested: pie chart renders correctly, amounts sum to estate value ✓

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculationsAPI, downloadPDF } from '../../lib/api';
import { isLoggedIn } from '../../lib/auth';

const COLORS = ['#1F4E45','#C9A227','#9FB8AE','#7A8C84','#D9C896','#3E6B60','#B68C2A','#5E7E74'];

function formatTaka(n) {
  return '৳' + Number(n).toLocaleString('en-IN');
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
    } catch (e) {
      setSaveError(e.message);
    } finally { setSaving(false); }
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
      <p className="text-ink-soft mb-6">It looks like you haven't run a calculation yet, or your session expired.</p>
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

  const pieData = result.heirs.map((h, i) => ({
    name: h.name,
    value: parseFloat(h.percent),
    color: COLORS[i % COLORS.length],
  }));

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
        <div className="bg-teal rounded-lg p-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Estate Value', value: formatTaka(result.estateValue) },
            { label: 'Heirs Identified', value: result.heirs.length },
            { label: 'Fully Distributed', value: result.totalFraction === '1' ? 'Yes ✓' : result.totalFraction },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-xs font-mono uppercase tracking-widest text-cream opacity-70 mb-1">{item.label}</p>
              <p className="text-2xl font-serif font-bold text-cream">{item.value}</p>
            </div>
          ))}
        </div>

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
                  <th className="text-left py-2 px-3">Heir</th>
                  <th className="text-left py-2 px-3">Share</th>
                  <th className="text-left py-2 px-3">Basis</th>
                  <th className="text-right py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.heirs.map((h, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-cream'}`}>
                    <td className="py-3 px-3 font-medium">{h.name}<span className="block text-xs text-ink-soft font-normal">{h.role}</span></td>
                    <td className="py-3 px-3 font-mono font-semibold text-teal-deep">{h.fractionDisplay}<span className="block text-xs text-ink-soft font-normal">{h.percent}%</span></td>
                    <td className="py-3 px-3">
                      <span className={h.basis === 'residuary' ? 'badge-residuary' : 'badge-fixed'}>
                        {h.basis === 'residuary' ? 'Residuary' : 'Fixed'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-right">{formatTaka(h.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-teal font-semibold">
                  <td colSpan={3} className="py-3 px-3">Total Distributed</td>
                  <td className="py-3 px-3 font-mono text-right">{formatTaka(result.totalDistributed)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
            <Link href="/register" className="text-teal font-medium">register</Link> to save your calculation and download reports.
          </p>
        )}

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
