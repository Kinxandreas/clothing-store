'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const totalItems = useCartStore(state => state.totalItems);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-brand-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">KSTORE</Link>
        <div className="flex items-center gap-8">
          <Link href="/shop" className="text-sm font-medium hover:text-accent transition-colors">Shop</Link>
          <Link href="/cart" className="relative text-sm font-medium hover:text-accent transition-colors">
            Cart
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </Link>
          <Link href="/admin" className="text-sm font-medium text-brand-300 hover:text-accent transition-colors">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
