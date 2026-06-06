import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ gender?: string; category?: string }> }) {
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-bold mb-2">Shop</h1>
      <p className="text-brand-300 mb-10">
        {products?.length ?? 0} items
        {gender ? ` · ${gender}` : ''}
        {category ? ` · ${category}` : ''}
      </p>

      {/* Gender filters */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {[['All', ''], ['Men', 'men'], ['Women', 'women'], ['Unisex', 'unisex'], ['Kids', 'kids']].map(([label, value]) => (
          <a
            key={value}
            href={value ? `/shop?gender=${value}` : '/shop'}
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
              gender === value || (!gender && value === '')
                ? 'bg-brand-800 text-white border-brand-800'
                : 'border-brand-300 hover:border-brand-800'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 text-brand-300">
          <p className="text-xl font-medium">No products found</p>
          <p className="mt-2 text-sm">Try a different filter or check back soon.</p>
        </div>
      )}
    </div>
  );
}
