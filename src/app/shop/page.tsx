'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const count = products.length;

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-stone-200 px-6 md:px-10 pt-14 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <span className="eyebrow text-stone-400 block mb-3 fade-up">Browse</span>
          <h1 className="display fade-up-delay-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            All Products
          </h1>
          <p className="eyebrow text-stone-400 mt-2 fade-up-delay-2">
            {loading ? '...' : `${count} ${count === 1 ? 'item' : 'items'}`}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-stone-100 animate-pulse rounded" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: Product, i: number) => (
              <div
                key={p.id}
                className="reveal"
                style={{ transitionDelay: `${Math.min(i * 0.06, 0.4)}s` }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="display text-stone-200" style={{ fontSize: '4rem' }}>∅</p>
            <p className="display text-stone-400 mt-4" style={{ fontSize: '1.6rem' }}>Nothing here yet</p>
            <p className="eyebrow text-stone-400 mt-3">Check back soon for new drops</p>
          </div>
        )}
      </div>
    </div>
  );
}
