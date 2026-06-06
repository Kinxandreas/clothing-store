'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const totalItems = useCartStore(state => state.totalItems);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [['Shop', '/shop'], ['Men', '/shop?gender=men'], ['Women', '/shop?gender=women'], ['Kids', '/shop?gender=kids']];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-paper/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(15,14,12,0.08)]' : 'bg-paper'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[60px] grid grid-cols-3 items-center">

          {/* Left */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href}
                className="eyebrow text-stone-500 hover:text-ink transition-colors duration-200 link-underline">
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col justify-center gap-[5px]"
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

          {/* Logo */}
          <Link href="/" className="flex justify-center col-start-2">
            <span className="display tracking-[0.22em] text-[1.35rem] text-ink select-none">
              KSTORE
            </span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center justify-end gap-5">
            <Link href="/login" aria-label="Account"
              className="text-stone-500 hover:text-ink transition-colors duration-200">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
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
        </div>
      </div>
    </>
  );
}
