import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/database';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'active')
    .limit(8);

  return (
    <div>
      {/* ══ HERO ══ */}
      {/* -mt accounts for navbar (88px) + announcement bar (34px) = 122px */}
      <section className="relative overflow-hidden bg-stone-900 -mt-[122px]" style={{ height: '96vh', minHeight: '560px' }}>
        <Image
          src="/hero.jpg"
          alt="KINX Streetwear Hero"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />
      </section>

      {/* ══ NEW ARRIVALS ══ */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow text-stone-400 block mb-3">Just Dropped</span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>New Arrivals</h2>
          </div>
          <Link href="/shop" className="eyebrow text-stone-500 hover:text-ink transition-colors link-underline hidden md:block">View All</Link>
        </div>
        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 4).map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="py-20 text-center"><p className="eyebrow text-stone-400">Coming soon</p></div>
        )}
      </section>

      {/* ══ FULL BLEED QUOTE ══ */}
      <section className="bg-ink text-paper py-24 px-6 text-center">
        <p className="display text-paper/80 mx-auto" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', maxWidth: '700px', lineHeight: 1.3 }}>
          &ldquo;The streets are your runway&nbsp;— <em>wear it like you mean it.</em>&rdquo;
        </p>
      </section>

      {/* ══ SECOND PRODUCT ROW ══ */}
      {featured && featured.length > 4 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>Also Fire</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(4, 8).map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ══ FEATURES ══ */}
      <section className="border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            ['Free Shipping', 'Orders over €80'],
            ['Easy Returns', '30 days, no questions'],
            ['Limited Drops', 'Exclusive pieces'],
            ['Secure Checkout', 'Encrypted & safe'],
          ].map(([title, sub], i) => (
            <div key={i} className={`py-10 px-8 text-center ${i < 3 ? 'border-r border-stone-200' : ''}`}>
              <p className="text-sm font-medium text-ink mb-1">{title}</p>
              <p className="eyebrow text-stone-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
