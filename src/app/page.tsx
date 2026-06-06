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
    .limit(4);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative bg-charcoal text-white overflow-hidden" style={{ minHeight: '88vh' }}>
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }} />

        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80"
            alt="Hero"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '88vh' }}>
          <span className="label text-white/50 mb-8 tracking-widest">New Collection 2026</span>
          <h1 className="font-display font-light leading-[1.05] mb-8"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', letterSpacing: '-0.01em' }}>
            Wear Your Story
          </h1>
          <p className="text-white/60 mb-12 max-w-sm font-light" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
            Curated clothing for every mood, every moment.
          </p>
          <Link
            href="/shop"
            className="label border border-white/40 text-white px-10 py-4 hover:bg-white hover:text-charcoal transition-all duration-300"
          >
            Discover the Collection
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="label" style={{ fontSize: '0.6rem' }}>Scroll</span>
          <div className="w-px h-12 bg-white/20" />
        </div>
      </section>

      {/* ── CATEGORY BANNERS ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Men',    href: '/shop?gender=men',    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=70' },
              { label: 'Women',  href: '/shop?gender=women',  img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=70' },
              { label: 'Unisex', href: '/shop?gender=unisex', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=70' },
              { label: 'Kids',   href: '/shop?gender=kids',   img: 'https://images.unsplash.com/photo-1622290291165-368c0a7e5c8f?w=600&q=70' },
            ].map(({ label, href, img }) => (
              <Link key={label} href={href} className="group relative block aspect-[3/4] overflow-hidden bg-brand-200">
                <Image
                  src={img} alt={label} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="label text-white">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="label text-brand-400 block mb-3">Just Arrived</span>
            <h2 className="font-display font-light" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>New Arrivals</h2>
          </div>
          <Link href="/shop" className="label text-brand-500 hover:text-charcoal transition-colors hidden md:block">
            View All →
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-brand-300 rounded-sm py-24 text-center">
            <p className="label text-brand-400 mb-4">No products yet</p>
            <Link href="/admin" className="label text-accent hover:text-accent-hover transition-colors">Add from Admin →</Link>
          </div>
        )}

        <div className="text-center mt-12 md:hidden">
          <Link href="/shop" className="label border border-charcoal text-charcoal px-8 py-3 hover:bg-charcoal hover:text-white transition-colors">
            View All
          </Link>
        </div>
      </section>

      {/* ── EDITORIAL BAND ── */}
      <section className="bg-charcoal text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="label text-white/40 block mb-6">Our Philosophy</span>
          <p className="font-display font-light leading-relaxed text-white/90"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)' }}>
            "Clothing is the first thing the world sees. We make sure it says exactly what you mean."
          </p>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="border-y border-brand-200 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '✦', title: 'Free Shipping', sub: 'On orders over €80' },
            { icon: '◈', title: 'Easy Returns',  sub: '30-day return policy' },
            { icon: '◉', title: 'Premium Quality', sub: 'Curated fabrics only' },
            { icon: '◎', title: 'Secure Payment', sub: 'Encrypted checkout' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <span className="text-accent text-lg">{icon}</span>
              <span className="font-medium text-sm tracking-wide">{title}</span>
              <span className="label text-brand-400">{sub}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
