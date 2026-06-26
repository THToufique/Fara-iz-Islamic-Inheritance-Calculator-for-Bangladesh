// components/layout/Footer.js
// Site footer with links and disclaimer
// Tested: all footer links navigate correctly ✓

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-cream-deep py-10 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-teal-deep mb-2">
              <span className="w-7 h-7 rounded-full bg-teal flex items-center justify-center text-cream text-sm">
                ف
              </span>
              Fara&apos;iz
            </div>
            <p className="text-sm text-ink-soft max-w-xs">
              A reference tool for Islamic estate division under Fara&apos;iz law in Bangladesh.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-ink-soft">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-teal-deep text-xs uppercase tracking-wider font-mono">Tools</span>
              <Link href="/calculator" className="hover:text-teal-deep">Calculator</Link>
              <Link href="/heirs" className="hover:text-teal-deep">Heir Rules</Link>
              <Link href="/checklist" className="hover:text-teal-deep">Documents</Link>
              <Link href="/landguide" className="hover:text-teal-deep">Land Registration</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-teal-deep text-xs uppercase tracking-wider font-mono">Info</span>
              <Link href="/faq" className="hover:text-teal-deep">FAQ & Glossary</Link>
              <Link href="/blog" className="hover:text-teal-deep">Blog</Link>
              <Link href="/professionals" className="hover:text-teal-deep">Find Professional</Link>
              <Link href="/about" className="hover:text-teal-deep">About</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-ink-soft">
          <p>
            This tool is for informational purposes only. It is not a substitute for a ruling (fatwa)
            from a qualified Islamic scholar or legal advice from a licensed professional.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Fara&apos;iz — Academic Project, Northern University Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  );
}
