'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '../../lib/api';
import { isAdmin } from '../../lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', content: '', category: 'inheritance_law', isPublished: false });
  const [articleMsg, setArticleMsg] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdmin()) { router.push('/'); return; }
    const fetchAll = async () => {
      try {
        const [statsData, pendingData, usersData] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getPendingProfessionals(),
          adminAPI.getUsers(),
        ]);
        setStats(statsData.stats);
        setPending(pendingData.professionals || []);
        setUsers(usersData.users || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [mounted, router]);

  const handleApprove = async (id) => {
    try { await adminAPI.approveProfessional(id); setPending(prev => prev.filter(p => p._id !== id)); }
    catch (e) { alert('Failed: ' + e.message); }
  };

  const handleRemovePro = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try { await adminAPI.removeProfessional(id); setPending(prev => prev.filter(p => p._id !== id)); }
    catch (e) { alert('Failed: ' + e.message); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try { await adminAPI.deactivateUser(id); setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u)); }
    catch (e) { alert('Failed: ' + e.message); }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createArticle(articleForm);
      setArticleMsg('✓ Article created successfully.');
      setArticleForm({ title: '', excerpt: '', content: '', category: 'inheritance_law', isPublished: false });
    } catch (err) { setArticleMsg('Error: ' + err.message); }
  };

  const tabs = ['stats', 'professionals', 'users', 'articles'];

  if (!mounted) return null;
  if (loading) return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-ink-soft">Loading admin panel...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <p className="eyebrow">Admin</p>
          <h1 className="text-4xl font-serif font-bold text-teal-deep">Admin Panel</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-1 mb-8 bg-sage p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-teal text-cream' : 'text-teal-deep hover:bg-cream'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Calculations', value: stats.totalCalculations },
              { label: 'Professionals', value: stats.totalProfessionals },
              { label: 'Pending Approvals', value: stats.pendingProfessionals },
            ].map((s, i) => (
              <div key={i} className="card text-center">
                <p className="text-3xl font-bold text-teal-deep mb-1">{s.value}</p>
                <p className="text-xs text-ink-soft font-mono uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'professionals' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-teal-deep mb-4">Pending Approvals ({pending.length})</h2>
            {pending.length === 0 ? <p className="text-ink-soft text-sm">No pending applications.</p> : (
              <div className="space-y-4">
                {pending.map(pro => (
                  <div key={pro._id} className="card flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-teal-deep">{pro.name}</p>
                      <p className="text-sm text-ink-soft">{pro.category?.replace('_', ' ')} · {pro.district}</p>
                      <p className="text-xs text-ink-soft">{pro.user?.email}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleApprove(pro._id)} className="btn-primary text-sm py-1.5 px-4">Approve</button>
                      <button onClick={() => handleRemovePro(pro._id)} className="btn-ghost text-sm py-1.5 px-4 text-red-600 border-red-200">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-teal-deep mb-4">Registered Users ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-deep text-xs font-mono uppercase tracking-wide text-ink-soft">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-ink-soft">{u.email}</td>
                      <td className="py-3 px-4"><span className="badge-fixed">{u.role}</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-mono ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isActive && u.role !== 'admin' && (
                          <button onClick={() => handleDeactivate(u._id)} className="text-red-500 text-xs font-semibold hover:text-red-700">Deactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-serif font-bold text-teal-deep mb-4">Create Article</h2>
            <form onSubmit={handleCreateArticle} className="card space-y-4">
              {articleMsg && <p className={`text-sm ${articleMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{articleMsg}</p>}
              <div><label className="form-label">Title</label><input type="text" value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} className="form-input" required /></div>
              <div><label className="form-label">Excerpt</label><input type="text" value={articleForm.excerpt} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} className="form-input" maxLength={300} /></div>
              <div><label className="form-label">Content</label><textarea value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} className="form-input h-48 resize-y" required /></div>
              <div>
                <label className="form-label">Category</label>
                <select value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })} className="form-input">
                  <option value="inheritance_law">Inheritance Law</option>
                  <option value="property_guide">Property Guide</option>
                  <option value="common_mistakes">Common Mistakes</option>
                  <option value="news">News</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={articleForm.isPublished} onChange={e => setArticleForm({ ...articleForm, isPublished: e.target.checked })} className="accent-teal" />
                <span className="text-sm text-ink">Publish immediately</span>
              </label>
              <button type="submit" className="btn-primary">Create Article</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
