'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types/database';

export default function ProductCard({
  product,
  selectedVariantId,
}: {
  product: Product;
  selectedVariantId?: string | null;
}) {
  const images = product.product_images || [];

  // Per-variant image takes priority; fall back to product-level images
  const variantImages = selectedVariantId
    ? images.filter(img => img.variant_id === selectedVariantId)
    : [];
  const productImages = images.filter(img => img.variant_id === null);
  const displayImages = variantImages.length > 0 ? variantImages : productImages;

  const image1 = displayImages[0]?.image_url;
  const image2 = displayImages[1]?.image_url;
  const [hovered, setHovered] = useState(false);

  // Guard against Postgres returning price as a string
  const price =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price)) || 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className="relative img-container bg-stone-100 mb-4" style={{ aspectRatio: '3/4' }}>
        {/* Primary image */}
        {image1 ? (
          <Image
            src={image1}
            alt={product.title}
            fill
            className={`object-cover transition-opacity duration-500 ${
              hovered && image2 ? 'opacity-0' : 'opacity-100'
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="eyebrow text-stone-300">No Image</span>
          </div>
        )}
        {/* Hover image (second photo) */}
        {image2 && (
          <Image
            src={image2}
            alt={`${product.title} alt`}
            fill
            className={`object-cover absolute inset-0 transition-opacity duration-500 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {/* Quick-view slide-up */}
        <div
          className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0
            transition-transform duration-500 bg-ink/90 py-4"
          style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
        >
          <span className="eyebrow text-paper/90 flex items-center justify-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Quick View
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-normal text-ink leading-snug group-hover:underline underline-offset-2 transition-all">
            {product.title}
          </p>
          <p className="text-sm text-stone-500 tabular-nums flex-shrink-0">€{price.toFixed(2)}</p>
        </div>
        {product.category && (
          <p className="eyebrow text-stone-400">{product.category}</p>
        )}
      </div>
    </Link>
  );
}
