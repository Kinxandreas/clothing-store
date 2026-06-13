'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  // Fix: select items array directly so Zustand re-renders on change,
  // then derive count client-side to avoid SSR hydration mismatch.
  const items = useCartStore(state => state.items);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  // Sync cart count after hydration to prevent SSR mismatch
  useEffect(() => {
    setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
  }, [items]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close account dropdown when clicking outside
  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-account-menu]')) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accountOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAccountOpen(false);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav className="relative z-40 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[88px] flex items-center justify-between">

          {/* LEFT */}
          <div className="hidden md:flex items-center gap-9 w-[300px]">
            <Link href="/shop"
              className="text-stone-500 hover:text-ink transition-colors duration-200 tracking-widest uppercase font-medium"
              style={{ fontSize: '0.8rem', letterSpacing: '0.12em' }}>
              All Products
            </Link>
            <Link href="/collections"
              className="text-stone-500 hover:text-ink transition-colors duration-200 tracking-widest uppercase font-medium"
              style={{ fontSize: '0.8rem', letterSpacing: '0.12em' }}>
              Collections
            </Link>
          </div>

          {/* CENTRE — Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center">
              <Image
                src="/kinx-logo.jpg"
                alt="KINX"
                width={110}
                height={66}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <Link href="/cart" aria-label="Cart" className="md:hidden relative text-stone-500 hover:text-ink transition-colors duration-200 ml-auto mr-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-ink text-paper text-[9px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 tabular-nums">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden w-10 h-10 flex flex-col justify-center gap-[6px]"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${
              menuOpen ? 'rotate-45 translate-y-[8px] w-7' : 'w-7'
            }`} />
            <span className={`block h-px bg-ink transition-all duration-300 ${
              menuOpen ? 'opacity-0 w-5' : 'w-5'
            }`} />
            <span className={`block h-px bg-ink transition-all duration-300 origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[8px] w-7' : 'w-6'
            }`} />
          </button>

          {/* RIGHT — Account + Cart */}
          <div className="hidden md:flex items-center gap-6 w-[300px] justify-end">

            {/* Account */}
            <div className="relative" data-account-menu>
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen(v => !v)}
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                    className="text-stone-500 hover:text-ink transition-colors duration-200 flex items-center justify-center w-10 h-10"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-paper border border-stone-200 shadow-xl z-50">
                      {/* Email header */}
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-stone-400 truncate" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {user.email}
                        </p>
                      </div>

                      {/* My Orders */}
                      <Link
                        href="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-stone-600 hover:text-ink hover:bg-stone-50 transition-colors"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                          <rect x="9" y="3" width="6" height="4" rx="1" />
                          <line x1="9" y1="12" x2="15" y2="12" />
                          <line x1="9" y1="16" x2="13" y2="16" />
                        </svg>
                        My Orders
                      </Link>

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-stone-400 hover:text-red-500 hover:bg-stone-50 transition-colors border-t border-stone-100"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in"
                  className="text-stone-500 hover:text-ink transition-colors duration-200 flex items-center justify-center w-10 h-10"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="relative text-stone-500 hover:text-ink transition-colors duration-200 flex items-center justify-center w-10 h-10">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-ink text-paper text-[9px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div className={`md:hidden fixed inset-0 z-40 bg-paper transition-all duration-500 ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} style={{ paddingTop: '108px' }}>
        <div className="px-8 flex flex-col">
          <Link href="/shop" onClick={() => setMenuOpen(false)}
            className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
            All Products
          </Link>
          <Link href="/collections" onClick={() => setMenuOpen(false)}
            className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
            Collections
          </Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)}
            className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors flex items-center gap-4">
            Bag
            {cartCount > 0 && (
              <span className="bg-ink text-paper text-[11px] font-medium min-w-[22px] h-5 rounded-full flex items-center justify-center px-1 tabular-nums" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
                Orders
              </Link>
              <button
                onClick={handleSignOut}
                className="display text-[2.4rem] text-stone-400 py-4 text-left hover:text-red-500 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
