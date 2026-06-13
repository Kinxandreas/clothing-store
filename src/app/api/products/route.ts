import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, category, gender, status, created_at, product_images(image_url, sort_order)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten the first image into image_url for easy consumption by ProductCard
  const products = (data ?? []).map((p: any) => {
    const images = (p.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    const { product_images, ...rest } = p;
    return { ...rest, image_url: images[0]?.image_url ?? null };
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { title, slug, description, price, category, gender, imageUrl } = body;

  if (!title || !slug || !price) {
    return NextResponse.json({ error: 'title, slug, and price are required' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({ title, slug, description, price: parseFloat(price), category, gender, status: 'active' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (imageUrl) {
    await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: imageUrl,
      sort_order: 0,
    });
  }

  return NextResponse.json(product, { status: 201 });
}
