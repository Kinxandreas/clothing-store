'use client';

import { useEffect, useState, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/shop/categories?context=shop')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeFilter
      ? `/api/shop/products?category=${encodeURIComponent(activeFilter)}`
      : '/api/shop/products';
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeFilter]);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const els = gridRef.current.querySelectorAll('.reveal');
    els.forEach(el => el.classList.remove('visible'));
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.05 }
      );
      els.forEach(el => observer.observe(el));
      setTimeout(() => observer.disconnect(), 2000);
    });
  }, [loading, products]);

  const count = products.length;

  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 px-6 md:px-10 pt-14 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <span className="eyebrow text-stone-400 block mb-3 fade-up">Browse</span>
          <h1 className="display fade-up-delay-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>All Products</h1>
          <p className="eyebrow text-stone-400 mt-2 fade-up-delay-2">
            {loading ? '\u2026' : `${count} ${count === 1 ? 'item' : 'items'}`}
            {activeFilter && <span className="ml-2 text-stone-300">in {activeFilter}</span>}
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="border-b border-stone-100 px-6 md:px-10 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="max-w-[1400px] mx-auto flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setActiveFilter(null)}
              className={`flex-shrink-0 eyebrow px-4 py-2 transition-colors border ${
                activeFilter === null
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700'
              }`}
            >All</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(activeFilter === cat.name ? null : cat.name)}
                className={`flex-shrink-0 eyebrow px-4 py-2 transition-colors border ${
                  activeFilter === cat.name
                    ? 'border-stone-800 bg-stone-800 text-white'
                    : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700'
                }`}
              >{cat.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: Product, i: number) => (
              <div key={p.id} className="reveal" style={{ transitionDelay: `${Math.min(i * 0.06, 0.4)}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="display text-stone-200" style={{ fontSize: '4rem' }}>∅</p>
            <p className="display text-stone-400 mt-4" style={{ fontSize: '1.6rem' }}>
              {activeFilter ? `No ${activeFilter} products yet` : 'Nothing here yet'}
            </p>
            <p className="eyebrow text-stone-400 mt-3">Check back soon for new drops</p>
            {activeFilter && (
              <button onClick={() => setActiveFilter(null)} className="mt-6 eyebrow text-stone-900 underline underline-offset-4">
                View all products
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
