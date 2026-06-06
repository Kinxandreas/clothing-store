import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  const mainImage = product.product_images?.[0]?.image_url;
  const sizes = [...new Set(product.product_variants?.map((v: { size: string }) => v.size).filter(Boolean))];
  const colors = [...new Set(product.product_variants?.map((v: { color: string }) => v.color).filter(Boolean))];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-brand-100 rounded-2xl overflow-hidden">
          {mainImage ? (
            <Image src={mainImage} alt={product.title} width={600} height={600} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-300">No image</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm text-accent font-medium uppercase tracking-wider mb-2">{product.category}</p>
          <h1 className="font-display text-4xl font-bold mb-4">{product.title}</h1>
          <p className="text-3xl font-semibold mb-6">€{product.price.toFixed(2)}</p>
          <p className="text-brand-300 mb-8 leading-relaxed">{product.description}</p>

          <AddToCartButton product={product} sizes={sizes as string[]} colors={colors as string[]} />
        </div>
      </div>
    </div>
  );
}
