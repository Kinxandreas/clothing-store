'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  image_url: string | null;
  parent_id: string | null;
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [parent, setParent] = useState<Collection | null>(null);
  const [subcollections, setSubcollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all collections once (to resolve parent + children)
  useEffect(() => {
    fetch('/api/shop/collections')
      .then(r => r.json())
      .then(d => setAllCollections(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Fetch categories for filter bar
  useEffect(() => {
    fetch('/api/shop/categories?context=collections')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Fetch products when slug or filter changes
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const url = activeFilter
      ? `/api/shop/collections/${slug}/products?category=${encodeURIComponent(activeFilter)}`
      : `/api/shop/collections/${slug}/products`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const col: Collection | null = d.collection ?? null;
        setCollection(col);
        setProducts(Array.isArray(d.products) ? d.products : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, activeFilter]);

  // Derive parent + subcollections once we have collection + allCollections
  useEffect(() => {
    if (!collection || allCollections.length === 0) return;
    const p = collection.parent_id
      ? allCollections.find(c => c.id === collection.parent_id) ?? null
      : null;
    setParent(p);
    setSubcollections(allCollections.filter(c => c.parent_id === collection.id));
  }, [collection, allCollections]);

  const label = collection?.name ?? String(slug);
  const count = products.length;

  return (
    <div className="min-h-screen bg-paper">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 flex items-center gap-2 eyebrow text-stone-400 text-xs">
        <Link href="/collections" className="hover:text-ink transition-colors">Collections</Link>
        {parent && (
          <>
            <span className="text-stone-300">/</span>
            <Link href={`/collections/${parent.slug}`} className="hover:text-ink transition-colors">{parent.name}</Link>
          </>
        )}
        <span className="text-stone-300">/</span>
        <span className="text-ink">{label}</span>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 max-w-[1400px] mx-auto px-6 md:px-10 pt-6 pb-10">
        <span className="eyebrow text-stone-400 block mb-3">{parent ? `Part of ${parent.name}` : 'Collection'}</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>{label}</h1>
        <p className="eyebrow text-stone-400 mt-2">
          {loading ? '\u2026' : `${count} ${count === 1 ? 'item' : 'items'}`}
          {activeFilter && <span className="ml-2 text-stone-300">in {activeFilter}</span>}
        </p>
      </div>

      {/* Subcollections grid */}
      {subcollections.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
          <p className="eyebrow text-stone-400 mb-5 text-xs tracking-widest uppercase">Subcollections</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {subcollections.map(sub => (
              <Link key={sub.id} href={`/collections/${sub.slug}`} className="group block">
                <div className="overflow-hidden bg-stone-100 aspect-square">
                  {sub.image_url ? (
                    <Image
                      src={sub.image_url}
                      alt={sub.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-300">
                        <rect x="3" y="3" width="18" height="18" rx="1"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="eyebrow text-ink mt-3 tracking-widest uppercase" style={{ fontSize: '0.75rem' }}>
                  {sub.name}
                </p>
              </Link>
            ))}
          </div>
          <div className="border-t border-stone-100 mb-0" />
        </div>
      )}

      {/* Filter bar */}
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

      {/* Products */}
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
          <div className="py-24 text-center">
            <p className="display text-stone-300" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              {activeFilter ? `No ${activeFilter} here` : subcollections.length > 0 ? 'Browse the subcollections above' : 'Coming Soon'}
            </p>
            <p className="eyebrow text-stone-400 mt-4">
              {activeFilter ? 'Try a different filter or browse everything.' : 'This collection is being prepared.'}
            </p>
            {activeFilter ? (
              <button onClick={() => setActiveFilter(null)} className="eyebrow inline-block mt-8 bg-ink text-paper px-8 py-4 hover:bg-accent transition-colors duration-300">
                View All in Collection
              </button>
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
