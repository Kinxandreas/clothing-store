import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

const FILTERS = [['All', ''], ['Men', 'men'], ['Women', 'women'], ['Unisex', 'unisex'], ['Kids', 'kids']] as const;

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
      <div className="border-b border-stone-200 px-6 md:px-10 py-10">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="display mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All Products'}
          </h1>
          <p className="eyebrow text-stone-400">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
        {/* Filter bar */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map(([label, value]) => {
            const active = gender === value || (!gender && value === '');
            return (
              <a
                key={value}
                href={value ? `/shop?gender=${value}` : '/shop'}
                className={`eyebrow px-5 py-2.5 flex-shrink-0 border transition-all duration-200 ${
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'border-stone-300 text-stone-500 hover:border-ink hover:text-ink'
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="display text-stone-300" style={{ fontSize: '3rem' }}>Empty</p>
            <p className="eyebrow text-stone-400 mt-3">No items match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
