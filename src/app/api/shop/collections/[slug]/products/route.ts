import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const category = req.nextUrl.searchParams.get('category');

  // Resolve slug → collection id
  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (!collection) {
    return NextResponse.json({ collection: null, products: [] });
  }

  let query = supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'active')
    .eq('collection_id', collection.id)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data: products } = await query;

  return NextResponse.json({ collection, products: products ?? [] });
}
