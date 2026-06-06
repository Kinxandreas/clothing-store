import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]?.image_url;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image container */}
      <div className="relative img-container bg-stone-100 mb-4" style={{ aspectRatio: '3/4' }}>
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="eyebrow text-stone-300">No Image</span>
          </div>
        )}
        {/* Quick-view slide-up */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0
          transition-transform duration-500 bg-ink/90 py-4"
          style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}>
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
          <p className="text-sm font-normal text-ink leading-snug">{product.title}</p>
          <p className="text-sm text-stone-500 tabular-nums flex-shrink-0">€{product.price.toFixed(2)}</p>
        </div>
        {product.category && (
          <p className="eyebrow text-stone-400">{product.category}</p>
        )}
      </div>
    </Link>
  );
}
