import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'active')
    .limit(4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-800 text-white py-32 px-6 text-center">
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Wear Your Story
        </h1>
        <p className="text-lg text-white/70 max-w-md mx-auto mb-10">
          Curated clothing for every mood, every moment.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-accent text-white px-8 py-4 rounded-full font-medium hover:bg-accent-hover transition-colors"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl font-bold mb-10">New Arrivals</h2>
        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-brand-300">
            <p className="text-lg">No products yet. Add some from the admin panel!</p>
            <Link href="/admin" className="mt-4 inline-block text-accent underline">Go to Admin →</Link>
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/shop" className="border border-brand-800 text-brand-800 px-8 py-3 rounded-full hover:bg-brand-800 hover:text-white transition-colors">
            View All
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-brand-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Men', 'Women', 'Unisex', 'Kids'].map(cat => (
              <Link
                key={cat}
                href={`/shop?gender=${cat.toLowerCase()}`}
                className="bg-white rounded-2xl p-8 text-center font-semibold text-lg hover:shadow-md transition-shadow"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
