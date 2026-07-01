'use client';
// app/dashboard/page.js
// User dashboard - saved calculations list with view and delete actions
// Tested: redirects to login if not authenticated, deletes calculation from list ✓

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculationsAPI } from '../../lib/api';
import { isLoggedIn, getStoredUser } from '../../lib/auth';

function formatTaka(n) {
  return '৳' + Number(n).toLocaleString('en-IN');
}

export default function DashboardPage() {
  const router = useRouter();
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const user = getStoredUser();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const fetchCalcs = async () => {
      try {
        const data = await calculationsAPI.getAll();
        setCalculations(data.calculations || []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    fetchCalcs();
  }, [router]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this calculation?')) return;
    setDeletingId(id);
    try {
      await calculationsAPI.delete(id);
      setCalculations(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    } finally { setDeletingId(null); }
  };

  const handleView = (calc) => {
    // Store in sessionStorage so results page can display it
    sessionStorage.setItem('faraiz_result', JSON.stringify({
      hasResult: calc.hasResult !== undefined ? calc.hasResult : true,
      estateValue: calc.input.estateValue,
      heirs: calc.heirs,
      notes: calc.notes,
      totalFraction: calc.totalFraction,
      totalDistributed: calc.totalDistributed,
    }));
    sessionStorage.setItem('faraiz_input', JSON.stringify(calc.input));
    router.push('/results');
  };

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <p className="eyebrow">My Account</p>
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-2">
            Welcome, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-ink-soft">Your saved inheritance calculations and reports.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-teal-deep">Saved Calculations</h2>
          <Link href="/calculator" className="btn-primary text-sm py-2 px-4">+ New Calculation</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse h-16" />
            ))}
          </div>
        ) : calculations.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">📋</p>
            <h3 className="font-serif font-bold text-teal-deep text-xl mb-2">No saved calculations yet</h3>
            <p className="text-ink-soft text-sm mb-6">Run a calculation and save it to see it here.</p>
            <Link href="/calculator" className="btn-primary">Start a Calculation</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-deep text-xs font-mono uppercase tracking-wide text-ink-soft">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Label</th>
                  <th className="text-left py-3 px-4">Estate Value</th>
                  <th className="text-left py-3 px-4">Heirs</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc, i) => (
                  <tr key={calc._id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                    <td className="py-3 px-4 text-ink-soft">
                      {new Date(calc.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">{calc.label || '—'}</td>
                    <td className="py-3 px-4 font-mono">{formatTaka(calc.input?.estateValue)}</td>
                    <td className="py-3 px-4">{calc.heirs?.length || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(calc)} className="text-teal text-xs font-semibold hover:text-teal-deep">
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(calc._id)}
                          disabled={deletingId === calc._id}
                          className="text-red-500 text-xs font-semibold hover:text-red-700 disabled:opacity-40"
                        >
                          {deletingId === calc._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
