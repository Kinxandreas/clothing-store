import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

const collectionMeta: Record<string, { label: string; description: string }> = {
  'collection-1': { label: 'Collection 1', description: 'The first drop from KINX.' },
  'collection-2': { label: 'Collection 2', description: 'Bold pieces from our second release.' },
  'collection-3': { label: 'Collection 3', description: 'Street-ready fits for every occasion.' },
  'collection-4': { label: 'Collection 4', description: 'Limited edition — built for the streets.' },
  'collection-5': { label: 'Collection 5', description: 'The latest drop. Fresh out the box.' },
};

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = collectionMeta[slug] ?? { label: slug, description: '' };

  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'active')
    .eq('collection', slug);

  return (
    <div className="min-h-screen bg-paper">
      {/* Back */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
        <Link href="/collections" className="eyebrow text-stone-400 hover:text-ink transition-colors text-xs">
          ← All Collections
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-6 pb-12">
        <span className="eyebrow text-stone-400 block mb-3">Collection</span>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>{meta.label}</h1>
        {meta.description && (
          <p className="eyebrow text-stone-400 mt-3">{meta.description}</p>
        )}
      </div>

      {/* Products */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="display text-stone-300" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>Coming Soon</p>
            <p className="eyebrow text-stone-400 mt-4">This collection is being prepared.</p>
            <Link href="/shop" className="eyebrow inline-block mt-8 bg-ink text-paper px-8 py-4 hover:bg-accent transition-colors duration-300">
              Shop All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
