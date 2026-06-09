'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const collections = [
  { label: 'Collection 1', href: '/collections/collection-1' },
  { label: 'Collection 2', href: '/collections/collection-2' },
  { label: 'Collection 3', href: '/collections/collection-3' },
  { label: 'Collection 4', href: '/collections/collection-4' },
  { label: 'Collection 5', href: '/collections/collection-5' },
];

export default function Navbar() {
  const totalItems = useCartStore(state => state.totalItems);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();
  const collectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
      setAccountOpen(false);
    };
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
      {/* Absolute — overlays the hero, scrolls away with page */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[64px] flex items-center justify-between">

          {/* LEFT — All Products + Collections */}
          <div className="hidden md:flex items-center gap-7 w-[260px]">
            {/* All Products */}
            <Link href="/shop"
              className="eyebrow text-white/80 hover:text-white transition-colors duration-200 link-underline whitespace-nowrap">
              All Products
            </Link>

            {/* Collections dropdown */}
            <div className="relative" ref={collectionsRef}>
              <button
                onClick={e => { e.stopPropagation(); setCollectionsOpen(v => !v); }}
                className="eyebrow text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-1">
                Collections
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className={`transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Dropdown */}
              {collectionsOpen && (
                <div className="absolute left-0 top-8 w-48 bg-paper border border-stone-200 shadow-lg z-50">
                  {collections.map(c => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setCollectionsOpen(false)}
                      className="block px-5 py-3 eyebrow text-stone-600 hover:text-ink hover:bg-stone-50 transition-colors text-xs border-b border-stone-100 last:border-0">
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTRE — Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center">
              <Image
                src="/kinx-logo.jpg"
                alt="KINX"
                width={80}
                height={48}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col justify-center gap-[5px]"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={`block h-px transition-all duration-300 origin-center ${
              menuOpen ? 'rotate-45 translate-y-[7px] w-6 bg-ink' : 'w-6 bg-white'
            }`} />
            <span className={`block h-px transition-all duration-300 ${
              menuOpen ? 'opacity-0 w-4 bg-ink' : 'w-4 bg-white'
            }`} />
            <span className={`block h-px transition-all duration-300 origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[7px] w-6 bg-ink' : 'w-5 bg-white'
            }`} />
          </button>

          {/* RIGHT — Account + Cart */}
          <div className="hidden md:flex items-center gap-5 w-[260px] justify-end">
            {/* Account */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setAccountOpen(v => !v); }}
                    aria-label="Account menu"
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-8 w-48 bg-paper border border-stone-200 shadow-lg z-50" onClick={e => e.stopPropagation()}>
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="eyebrow text-stone-400 truncate text-xs">{user.email}</p>
                      </div>
                      <Link href="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-3 eyebrow text-stone-600 hover:text-ink hover:bg-stone-50 transition-colors text-xs">
                        My Orders
                      </Link>
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-3 eyebrow text-stone-400 hover:text-red-500 hover:bg-stone-50 transition-colors text-xs border-t border-stone-100">
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" aria-label="Sign in" className="text-white/80 hover:text-white transition-colors duration-200">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="relative text-white/80 hover:text-white transition-colors duration-200">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-ink text-[9px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 tabular-nums">
                  {totalItems()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: Cart icon always visible */}
          <Link href="/cart" aria-label="Cart" className="md:hidden relative text-white/80 hover:text-white transition-colors duration-200 ml-auto mr-4">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-ink text-[9px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 tabular-nums">
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
          <Link href="/shop" onClick={() => setMenuOpen(false)}
            className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
            All Products
          </Link>
          <Link href="/collections" onClick={() => setMenuOpen(false)}
            className="display text-[2.4rem] text-ink py-4 border-b border-stone-200 hover:text-accent transition-colors">
            Collections
          </Link>
          {collections.map(c => (
            <Link key={c.href} href={c.href} onClick={() => setMenuOpen(false)}
              className="eyebrow text-stone-400 py-3 pl-4 border-b border-stone-100 hover:text-ink transition-colors">
              {c.label}
            </Link>
          ))}
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
