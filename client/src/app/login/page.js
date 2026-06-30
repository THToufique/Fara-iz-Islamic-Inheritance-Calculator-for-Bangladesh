'use client';
// app/login/page.js
// Login form - email + password, saves JWT to localStorage on success
// Tested: valid credentials redirect to dashboard, invalid show error ✓

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../lib/api';
import { saveAuth } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await authAPI.login(form);
      saveAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center text-cream text-2xl font-serif mx-auto mb-4">ف</div>
          <h1 className="text-3xl font-serif font-bold text-teal-deep mb-2">Welcome back</h1>
          <p className="text-ink-soft text-sm">Login to access your saved calculations and dashboard.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>
            )}
            <div>
              <label className="form-label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="form-input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-ink-soft">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-teal font-semibold hover:text-teal-deep">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
