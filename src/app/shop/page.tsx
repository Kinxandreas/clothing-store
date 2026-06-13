import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; category?: string }>;
}) {
  const { gender, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (gender) query = query.eq('gender', gender);
  if (category) query = query.eq('category', category);

  const { data: products } = await query;
  const count = products?.length ?? 0;

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-stone-200 px-6 md:px-10 pt-14 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <span className="eyebrow text-stone-400 block mb-3 fade-up">Browse</span>
          <h1 className="display fade-up-delay-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All Products'}
          </h1>
          <p className="eyebrow text-stone-400 mt-2 fade-up-delay-2">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: Product, i) => (
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
