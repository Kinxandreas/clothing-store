import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]?.image_url;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-brand-100 overflow-hidden mb-4">
        {image ? (
          <Image
            src={image} alt={product.title}
            fill className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="label text-brand-300">No Image</span>
          </div>
        )}
        {/* Quick-view overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-charcoal/90">
          <span className="label text-white flex items-center justify-center py-4">Quick View</span>
        </div>
      </div>
      {/* Info */}
      <div className="space-y-1">
        <p className="text-sm font-medium tracking-wide text-charcoal">{product.title}</p>
        <p className="label text-brand-400">{product.category}</p>
        <p className="text-sm font-medium text-charcoal mt-1">€{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
