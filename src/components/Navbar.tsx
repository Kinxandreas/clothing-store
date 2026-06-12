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
  const [user, setUser] = useState<User | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setAccountOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAccountOpen(false);
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

          {/* Mobile cart + hamburger */}
          <Link href="/cart" aria-label="Cart" className="md:hidden relative text-stone-500 hover:text-ink transition-colors duration-200 ml-auto mr-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
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
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setAccountOpen(v => !v); }}
                    aria-label="Account menu"
                    className="text-stone-500 hover:text-ink transition-colors duration-200"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-10 w-52 bg-paper border border-stone-200 shadow-xl z-50" onClick={e => e.stopPropagation()}>
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-stone-400 truncate" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{user.email}</p>
                      </div>
                      <Link href="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-3.5 text-stone-600 hover:text-ink hover:bg-stone-50 transition-colors" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                        My Orders
                      </Link>
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-3.5 text-stone-400 hover:text-red-500 hover:bg-stone-50 transition-colors border-t border-stone-100" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" aria-label="Sign in" className="text-stone-500 hover:text-ink transition-colors duration-200">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </Link>
              )}
            </div>

            <Link href="/cart" aria-label="Cart" className="relative text-stone-500 hover:text-ink transition-colors duration-200">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
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
          {user ? (
            <>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
                Orders
              </Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false); }}
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
