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
      {/* -mt offsets navbar (88px) + announcement bar (34px) = 122px */}
      <section
        className="relative overflow-hidden bg-stone-900 -mt-[122px]"
        style={{ height: '100dvh', minHeight: '580px' }}
      >
        <Image
          src="/hero.jpg"
          alt="KINX Streetwear Hero"
          fill
          priority
          className="object-cover fade-in"
          sizes="100vw"
          quality={100}
        />
        {/* subtle bottom vignette only */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center px-6">
          <span className="eyebrow text-white/60 mb-4 fade-up-delay-1">Cyprus Streetwear</span>
          <h1
            className="display text-white mb-6 fade-up-delay-2"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 7rem)', letterSpacing: '-0.01em' }}
          >
            Rule Your Own
          </h1>
          <Link
            href="/shop"
            className="eyebrow text-white border border-white/60 px-8 py-3.5 hover:bg-white hover:text-ink transition-all duration-300 fade-up-delay-3 btn-press"
          >
            Shop Now
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 fade-up-delay-4">
          <span className="eyebrow text-white/30" style={{ fontSize: '0.5rem' }}>SCROLL</span>
          <div className="w-px h-10 bg-white/20 relative overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-1/2 bg-white/60"
              style={{ animation: 'scrollDot 1.6s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scrollDot {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>

      {/* ══ NEW ARRIVALS ══ */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 reveal">
          <div>
            <span className="eyebrow text-stone-400 block mb-3">Just Dropped</span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>New Arrivals</h2>
          </div>
          <Link href="/shop" className="eyebrow text-stone-500 hover:text-ink transition-colors link-underline hidden md:block">
            View All
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 4).map((p: Product, i) => (
              <div key={p.id} className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center reveal">
            <p className="eyebrow text-stone-400">Coming soon</p>
          </div>
        )}
      </section>

      {/* ══ FULL BLEED QUOTE ══ */}
      <section className="bg-ink text-paper py-28 px-6 text-center overflow-hidden">
        <p
          className="display text-paper/80 mx-auto reveal"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', maxWidth: '700px', lineHeight: 1.3 }}
        >
          &ldquo;The streets are your runway&nbsp;— <em>wear it like you mean it.</em>&rdquo;
        </p>
      </section>

      {/* ══ SECOND PRODUCT ROW ══ */}
      {featured && featured.length > 4 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <div className="flex items-end justify-between mb-12 reveal">
            <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>Also Fire</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(4, 8).map((p: Product, i) => (
              <div key={p.id} className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ FEATURES STRIP ══ */}
      <section className="border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            ['Free Shipping', 'Orders over €80'],
            ['Easy Returns', '30 days, no questions'],
            ['Limited Drops', 'Exclusive pieces'],
            ['Secure Checkout', 'Encrypted & safe'],
          ].map(([title, sub], i) => (
            <div
              key={i}
              className={`py-10 px-8 text-center reveal reveal-delay-${Math.min(i + 1, 4)} ${
                i < 3 ? 'border-r border-stone-200' : ''
              }`}
            >
              <p className="text-sm font-medium text-ink mb-1">{title}</p>
              <p className="eyebrow text-stone-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
