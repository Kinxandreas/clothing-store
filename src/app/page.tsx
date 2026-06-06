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
      <section className="relative overflow-hidden bg-stone-900" style={{ height: '96vh', minHeight: '560px' }}>
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1800&q=85"
          alt="Hero"
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-16 md:pb-20">
          <span className="eyebrow text-white/50 mb-5 fade-up">Spring / Summer 2026</span>
          <h1 className="display text-white leading-none mb-7 fade-up fade-up-delay-1"
            style={{ fontSize: 'clamp(3.5rem, 7vw, 7.5rem)' }}>
            Wear Your<br />
            <em>Story</em>
          </h1>
          <div className="flex items-center gap-6 fade-up fade-up-delay-2">
            <Link href="/shop"
              className="eyebrow bg-white text-ink px-9 py-4 hover:bg-accent hover:text-white transition-all duration-300">
              Shop Now
            </Link>
            <Link href="/shop?gender=men"
              className="eyebrow text-white/70 hover:text-white transition-colors duration-200 link-underline">
              Men’s Collection →
            </Link>
          </div>
        </div>

        {/* Bottom scroll line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/20" />
      </section>

      {/* ══ MARQUEE BAND ══ */}
      <div className="border-y border-stone-200 overflow-hidden" style={{ height: '44px' }}>
        <div className="marquee flex items-center h-full whitespace-nowrap">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="eyebrow text-stone-400 px-10">
              NEW ARRIVALS &nbsp;—&nbsp; PREMIUM QUALITY &nbsp;—&nbsp; FREE SHIPPING OVER €80 &nbsp;—&nbsp; CURATED SINCE 2020
            </span>
          ))}
        </div>
      </div>

      {/* ══ SPLIT EDITORIAL ══ */}
      <section className="grid md:grid-cols-2">
        {/* Left: large image */}
        <div className="relative img-container" style={{ aspectRatio: '4/5' }}>
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80"
            alt="Women's Collection"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          <div className="absolute bottom-8 left-8">
            <span className="eyebrow text-white/60 block mb-2">Women</span>
            <Link href="/shop?gender=women" className="display text-white text-4xl hover:text-accent transition-colors">
              Women’s Edit
            </Link>
          </div>
        </div>
        {/* Right: stacked two images */}
        <div className="flex flex-col">
          <div className="relative img-container flex-1" style={{ minHeight: '260px' }}>
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80"
              alt="Men's Collection"
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <div className="absolute bottom-6 left-7">
              <span className="eyebrow text-white/60 block mb-1">Men</span>
              <Link href="/shop?gender=men" className="display text-white text-3xl hover:text-accent transition-colors">
                Men’s Edit
              </Link>
            </div>
          </div>
          <div className="relative img-container flex-1 bg-sand" style={{ minHeight: '260px' }}>
            <Image
              src="https://images.unsplash.com/photo-1622290291165-368c0a7e5c8f?w=700&q=80"
              alt="Kids Collection"
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <div className="absolute bottom-6 left-7">
              <span className="eyebrow text-white/60 block mb-1">Kids</span>
              <Link href="/shop?gender=kids" className="display text-white text-3xl hover:text-accent transition-colors">
                Kids’ Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEW ARRIVALS ══ */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow text-stone-400 block mb-3">Just In</span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>New Arrivals</h2>
          </div>
          <Link href="/shop" className="eyebrow text-stone-500 hover:text-ink transition-colors link-underline hidden md:block">
            View All
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 4).map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-stone-300 py-28 text-center">
            <p className="eyebrow text-stone-400 mb-3">No products yet</p>
            <Link href="/admin" className="eyebrow text-accent link-underline">Add from Admin →</Link>
          </div>
        )}
      </section>

      {/* ══ FULL BLEED QUOTE ══ */}
      <section className="bg-ink text-paper py-24 px-6 text-center">
        <p className="display text-paper/80 mx-auto"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', maxWidth: '700px', lineHeight: 1.3 }}>
          &ldquo;The first thing the world sees&nbsp;—
          <em>make it exactly what you mean.</em>&rdquo;
        </p>
      </section>

      {/* ══ SECOND PRODUCT ROW ══ */}
      {featured && featured.length > 4 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>Also Popular</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(4, 8).map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ══ FEATURES ══ */}
      <section className="border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            ['Free Shipping', 'Orders over €80'],
            ['Easy Returns',  '30 days, no questions'],
            ['Premium Only',  'Curated fabrics'],
            ['Secure',        'Encrypted checkout'],
          ].map(([title, sub], i) => (
            <div key={i} className={`py-10 px-8 text-center ${
              i < 3 ? 'border-r border-stone-200' : ''
            }`}>
              <p className="text-sm font-medium text-ink mb-1">{title}</p>
              <p className="eyebrow text-stone-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
