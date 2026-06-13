import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';

interface ProductVariant {
  id: string;
  label: string;
  value: string;
  image_url: string | null;
  sort_order: number;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  const images: { image_url: string; sort_order: number }[] =
    (product.product_images || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
  const mainImage = images[0]?.image_url;

  const allVariants: ProductVariant[] = (product.product_variants || []).sort(
    (a: ProductVariant, b: ProductVariant) => a.sort_order - b.sort_order
  );

  // Group by label (Color, Size, etc.)
  const variantGroups = allVariants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!acc[v.label]) acc[v.label] = [];
    acc[v.label].push(v);
    return acc;
  }, {});

  // Collect variants that have an image (used for image-swap on the client)
  const variantsWithImages = allVariants.filter(v => v.image_url);

  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20">

          {/* ── Image column ── */}
          <div className="space-y-3 scale-in">
            <div
              className="relative img-container bg-stone-100"
              style={{ aspectRatio: '3/4' }}
              id="main-image-wrap"
            >
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  id="main-product-image"
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
              €{price.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-[14px] text-stone-500 leading-relaxed mb-10 max-w-[420px] fade-up-delay-3">
                {product.description}
              </p>
            )}

            <div className="border-t border-stone-200 mb-8" />

            {/* ── Variant selectors ── */}
            {Object.keys(variantGroups).length > 0 && (
              <div className="space-y-5 mb-8 fade-up-delay-3">
                {Object.entries(variantGroups).map(([label, options]) => (
                  <div key={label}>
                    <p className="eyebrow text-stone-500 mb-2">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {options.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          data-variant-image={opt.image_url ?? ''}
                          className="variant-btn px-4 py-2 border border-stone-200 text-sm text-stone-700 hover:border-stone-800 transition-colors"
                          aria-label={`${label}: ${opt.value}`}
                        >
                          {opt.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="fade-up-delay-3">
              <AddToCartButton product={product} sizes={[]} colors={[]} />
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

      {/* Client-side image swap when a variant is clicked */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var defaultSrc = ${JSON.stringify(mainImage ?? '')};
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.variant-btn');
            if (!btn) return;
            var imgEl = document.getElementById('main-product-image');
            if (!imgEl) return;
            var variantImg = btn.getAttribute('data-variant-image');
            // Toggle: clicking same button again restores default
            var isSame = btn.classList.contains('variant-active');
            document.querySelectorAll('.variant-btn').forEach(function(b) {
              b.classList.remove('variant-active');
              b.style.borderColor = '';
              b.style.fontWeight = '';
            });
            if (!isSame) {
              btn.classList.add('variant-active');
              btn.style.borderColor = '#1c1b19';
              btn.style.fontWeight = '600';
              if (variantImg) { imgEl.src = variantImg; imgEl.srcset = variantImg; }
            } else {
              if (defaultSrc) { imgEl.src = defaultSrc; imgEl.srcset = defaultSrc; }
            }
          });
        })();
      ` }} />
    </div>
  );
}
