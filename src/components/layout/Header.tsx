'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cart count
    const readCart = () => {
      try {
        const saved = localStorage.getItem('tink-prescription');
        const items = saved ? JSON.parse(saved) : [];
        const total = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    readCart();
    window.addEventListener('cart-updated', readCart);
    window.addEventListener('storage', readCart);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('cart-updated', readCart);
      window.removeEventListener('storage', readCart);
    };
  }, []);

  const navItems = [
    { label: 'Doses', href: '/doses' },
    { label: 'Bulletin', href: '/bulletin' },
    { label: 'Lab Access', href: '/access' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const accountLabel = user ? 'Patient Profile' : 'Login';
  const accountHref = user ? '/profile' : '/login';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/tink-logo.png"
              alt="Tink"
              width={300}
              height={180}
              priority
              className="h-12 md:h-14 w-auto object-contain"
            />
            <span className="hidden sm:inline text-label opacity-50 group-hover:opacity-100 transition-opacity border-l border-border pl-3">
              TINKORPORATED
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors font-mono"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href={accountHref}
              className="hidden md:block text-[10px] tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors font-mono"
            >
              {accountLabel}
            </Link>
            <Link
              href="/prescription"
              className="relative text-[10px] tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors font-mono flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70">
                <rect x="4" y="3" width="16" height="18" />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="13" y2="16" />
              </svg>
              <span className="hidden sm:inline">Prescription</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-3 text-[9px] font-mono font-bold text-[#FF6A00]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col gap-[5px] p-1"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[1px] bg-foreground transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block w-5 h-[1px] bg-foreground transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1px] bg-foreground transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-slide-down">
          <nav className="max-w-[1440px] mx-auto px-4 py-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors font-mono py-2 border-b border-border"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={accountHref}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors font-mono py-2"
            >
              {accountLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
