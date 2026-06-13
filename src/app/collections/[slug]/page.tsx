'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shop/categories?context=collections')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const url = activeFilter
      ? `/api/shop/collections/${slug}/products?category=${encodeURIComponent(activeFilter)}`
      : `/api/shop/collections/${slug}/products`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setCollection(d.collection ?? null);
        setProducts(Array.isArray(d.products) ? d.products : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, activeFilter]);

  const label = collection?.name ?? String(slug);
  const count = products.length;

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
        <Link href="/collections" className="eyebrow text-stone-400 hover:text-ink transition-colors text-xs">
          ← All Collections
        </Link>
      </div>

      <div className="border-b border-stone-200 max-w-[1400px] mx-auto px-6 md:px-10 pt-6 pb-10">
        <span className="eyebrow text-stone-400 block mb-3">Collection</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>{label}</h1>
        <p className="eyebrow text-stone-400 mt-2">
          {loading ? '\u2026' : `${count} ${count === 1 ? 'item' : 'items'}`}
          {activeFilter && <span className="ml-2 text-stone-300">in {activeFilter}</span>}
        </p>
      </div>

      {categories.length > 0 && (
        <div className="border-b border-stone-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
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

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="display text-stone-300" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              {activeFilter ? `No ${activeFilter} in this collection` : 'Coming Soon'}
            </p>
            <p className="eyebrow text-stone-400 mt-4">
              {activeFilter ? 'Try a different filter or browse everything.' : 'This collection is being prepared.'}
            </p>
            {activeFilter ? (
              <button
                onClick={() => setActiveFilter(null)}
                className="eyebrow inline-block mt-8 bg-ink text-paper px-8 py-4 hover:bg-accent transition-colors duration-300"
              >View All in Collection</button>
            ) : (
              <Link href="/shop" className="eyebrow inline-block mt-8 bg-ink text-paper px-8 py-4 hover:bg-accent transition-colors duration-300">
                Shop All Products
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
