import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]?.image_url;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-[3/4] bg-brand-100 rounded-2xl overflow-hidden mb-3 group-hover:shadow-md transition-shadow">
        {image ? (
          <Image src={image} alt={product.title} width={400} height={533} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-300 text-sm">No image</div>
        )}
      </div>
      <p className="font-medium text-sm">{product.title}</p>
      <p className="text-accent font-semibold mt-1">€{product.price.toFixed(2)}</p>
    </Link>
  );
}
