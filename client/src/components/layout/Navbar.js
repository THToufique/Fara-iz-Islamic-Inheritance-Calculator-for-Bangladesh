'use client';
// components/layout/Navbar.js
// Sticky top navigation with mobile hamburger menu
// Tested: mobile menu opens/closes, active link highlights correctly ✓

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isLoggedIn, getStoredUser, clearAuth } from '../../lib/auth';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/heirs', label: 'Heir Rules' },
  { href: '/checklist', label: 'Documents' },
  { href: '/faq', label: 'FAQ & Glossary' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check auth state on mount and route change
  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 font-serif text-xl font-bold text-teal-deep">
            <span className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-cream text-base">
              ف
            </span>
            Fara&apos;iz
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-7">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  pathname === link.href
                    ? 'text-teal-deep border-b-2 border-gold pb-0.5'
                    : 'text-ink-soft hover:text-teal-deep'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-ink-soft hover:text-teal-deep">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-teal-deep">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm py-2 px-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-teal-deep">
                  Login
                </Link>
                <Link href="/calculator" className="btn-primary text-sm py-2 px-4">
                  Calculate Shares
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-ink-soft"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 pt-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2.5 text-sm font-medium ${
                  pathname === link.href ? 'text-teal-deep font-semibold' : 'text-ink-soft'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-left text-sm text-ink-soft">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
