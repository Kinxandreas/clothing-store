'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { useState } from 'react';

export default function Navbar() {
  const totalItems = useCartStore(state => state.totalItems);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-brand-200">
        {/* Main nav row */}
        <div className="max-w-7xl mx-auto px-6 h-[68px] grid grid-cols-3 items-center">
          {/* Left: navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="label text-brand-600 hover:text-charcoal transition-colors">Shop</Link>
            <Link href="/shop?gender=men" className="label text-brand-600 hover:text-charcoal transition-colors">Men</Link>
            <Link href="/shop?gender=women" className="label text-brand-600 hover:text-charcoal transition-colors">Women</Link>
            <Link href="/shop?gender=kids" className="label text-brand-600 hover:text-charcoal transition-colors">Kids</Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-charcoal transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex justify-center">
            <span className="font-display text-3xl font-light tracking-[0.18em] text-charcoal select-none">
              KSTORE
            </span>
          </Link>

          {/* Right: icons */}
          <div className="flex items-center justify-end gap-6">
            <Link href="/login" aria-label="Account" className="text-brand-500 hover:text-charcoal transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link href="/cart" className="relative text-brand-500 hover:text-charcoal transition-colors" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-charcoal text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-cream pt-[104px]">
          <div className="flex flex-col gap-0 px-8 divide-y divide-brand-200">
            {[['Shop All', '/shop'], ['Men', '/shop?gender=men'], ['Women', '/shop?gender=women'], ['Kids', '/shop?gender=kids']].map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="label text-charcoal py-5 hover:text-accent transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
