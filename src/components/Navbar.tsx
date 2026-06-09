'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const totalItems = useCartStore(state => state.totalItems);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const close = () => setAccountOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [accountOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAccountOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks: [string, string][] = [
    ['Shop All', '/shop'],
    ['Clothing', '/shop?category=clothing'],
    ['Hats', '/shop?category=hats'],
    ['Keychains', '/shop?category=keychains'],
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-paper/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(15,14,12,0.08)]' : 'bg-paper'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[60px] flex items-center">

          {/* Logo — left */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/kinx-logo.jpg"
              alt="KINX"
              width={80}
              height={48}
              className="object-contain"
              priority
            />
          </Link>

          {/* Nav links — centered absolutely so they stay truly centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-9">
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href}
                className="eyebrow text-stone-500 hover:text-ink transition-colors duration-200 link-underline">
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col justify-center gap-[5px] ml-auto"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${
              menuOpen ? 'rotate-45 translate-y-[7px] w-6' : 'w-6'
            }`} />
            <span className={`block h-px bg-ink transition-all duration-300 ${
              menuOpen ? 'opacity-0 w-4' : 'w-4'
            }`} />
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[7px] w-6' : 'w-5'
            }`} />
          </button>

          {/* Right icons — pushed to far right */}
          <div className="hidden md:flex items-center gap-5 ml-auto">

            {/* Account */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setAccountOpen(v => !v); }}
                    aria-label="Account menu"
                    className="text-stone-500 hover:text-ink transition-colors duration-200"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div
                      className="absolute right-0 top-8 w-48 bg-paper border border-stone-200 shadow-lg z-50"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="eyebrow text-stone-400 truncate text-xs">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-3 eyebrow text-stone-600 hover:text-ink hover:bg-stone-50 transition-colors text-xs"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 eyebrow text-stone-400 hover:text-red-500 hover:bg-stone-50 transition-colors text-xs border-t border-stone-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" aria-label="Sign in"
                  className="text-stone-500 hover:text-ink transition-colors duration-200">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart"
              className="relative text-stone-500 hover:text-ink transition-colors duration-200">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-ink text-paper text-[9px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 tabular-nums">
                  {totalItems()}
                </span>
              )}
            </Link>
          </div>

          {/* Cart icon on mobile (always visible) */}
          <Link href="/cart" aria-label="Cart"
            className="md:hidden relative text-stone-500 hover:text-ink transition-colors duration-200 ml-4">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-ink text-paper text-[9px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 tabular-nums">
                {totalItems()}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div className={`md:hidden fixed inset-0 z-40 bg-paper transition-all duration-500 ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} style={{ paddingTop: '94px' }}>
        <div className="px-8 flex flex-col">
          {navLinks.map(([label, href], i) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors"
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}>
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors"
                style={{ transitionDelay: menuOpen ? '240ms' : '0ms' }}>
                Orders
              </Link>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="display text-[2.4rem] text-stone-400 py-4 text-left hover:text-red-500 transition-colors"
                style={{ transitionDelay: menuOpen ? '300ms' : '0ms' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors"
              style={{ transitionDelay: menuOpen ? '240ms' : '0ms' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
