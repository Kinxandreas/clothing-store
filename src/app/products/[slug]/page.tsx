import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  const images: { image_url: string }[] = product.product_images || [];
  const mainImage = images[0]?.image_url;
  const sizes = [...new Set(
    product.product_variants?.map((v: { size: string }) => v.size).filter(Boolean)
  )] as string[];
  const colors = [...new Set(
    product.product_variants?.map((v: { color: string }) => v.color).filter(Boolean)
  )] as string[];

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20">

          {/* ── Image column ── */}
          <div className="space-y-3 scale-in">
            <div className="relative img-container bg-stone-100" style={{ aspectRatio: '3/4' }}>
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="eyebrow text-stone-400">No Image</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1).map((img, i) => (
                  <div key={i} className="relative img-container bg-stone-100" style={{ aspectRatio: '1/1' }}>
                    <Image
                      src={img.image_url}
                      alt={`${product.title} ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="10vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info column ── */}
          <div className="md:sticky md:top-[80px] self-start pt-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8 fade-up">
              <Link href="/shop" className="eyebrow text-stone-400 hover:text-ink transition-colors link-underline">Shop</Link>
              <span className="text-stone-300 text-xs">/</span>
              <span className="eyebrow text-stone-500">{product.category}</span>
            </div>

            {/* Title & price */}
            <h1 className="display mb-3 fade-up-delay-1" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              {product.title}
            </h1>
            <p className="text-2xl font-light text-stone-600 mb-8 tabular-nums fade-up-delay-2">
              €{product.price.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-[14px] text-stone-500 leading-relaxed mb-10 max-w-[420px] fade-up-delay-3">
                {product.description}
              </p>
            )}

            <div className="border-t border-stone-200 mb-8" />

            <div className="fade-up-delay-3">
              <AddToCartButton product={product} sizes={sizes} colors={colors} />
            </div>

            {/* Details accordion */}
            <div className="mt-10 space-y-0 border-t border-stone-200 fade-up-delay-4">
              {([
                ['Composition', 'Premium natural fibres. Care label inside garment.'],
                ['Shipping',    'Free over €80. Delivered in 2–5 business days.'],
                ['Returns',     '30-day free return policy. Items must be unworn.'],
              ] as [string, string][]).map(([label, text]) => (
                <details key={label} className="group border-b border-stone-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer list-none select-none">
                    <span className="eyebrow text-ink">{label}</span>
                    <span className="text-stone-400 transition-transform duration-300 group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <p className="text-[13px] text-stone-500 pb-5 leading-relaxed">{text}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
