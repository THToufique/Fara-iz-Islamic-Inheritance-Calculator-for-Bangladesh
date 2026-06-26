// app/layout.js
// Root layout - wraps all pages with Navbar and Footer
// Tested: layout renders correctly on all pages, sticky nav works ✓

import '../styles/globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const metadata = {
  title: "Fara'iz — Islamic Inheritance Calculator Bangladesh",
  description:
    "Calculate Islamic inheritance shares (Fara'iz) for your family estate in Bangladesh. Free, accurate, and based on Qur\'anic rules.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
