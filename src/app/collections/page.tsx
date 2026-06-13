'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  parent_id: string | null;
}

function CollectionCard({ c, children }: { c: Collection; children?: Collection[] }) {
  return (
    <div>
      <Link href={`/collections/${c.slug}`} className="group block">
        <div className="overflow-hidden bg-stone-100">
          {c.image_url ? (
            <Image
              src={c.image_url}
              alt={c.name}
              width={500}
              height={500}
              className="object-cover w-full aspect-square group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center bg-stone-100">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-300">
                <rect x="3" y="3" width="18" height="18" rx="1"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>
        <p className="eyebrow text-ink mt-4 tracking-widest uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.14em' }}>
          {c.name}
        </p>
      </Link>
      {/* Subcollections listed below the card */}
      {children && children.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {children.map(sub => (
            <Link
              key={sub.id}
              href={`/collections/${sub.slug}`}
              className="eyebrow text-stone-500 hover:text-ink transition-colors text-[11px] tracking-widest uppercase border border-stone-200 px-3 py-1.5 hover:border-stone-400"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shop/collections')
      .then(r => r.json())
      .then(d => { setCollections(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const topLevel = collections.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => collections.filter(c => c.parent_id === parentId);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-10">
        <span className="eyebrow text-stone-400 block mb-3">Browse</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>Collections</h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="aspect-square bg-stone-100 animate-pulse" />)}
          </div>
        ) : topLevel.length === 0 ? (
          <div className="py-32 text-center">
            <p className="eyebrow text-stone-300 text-sm">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topLevel.map(c => (
              <CollectionCard key={c.id} c={c} children={getChildren(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
