import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/products — public, fetch all active products
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const gender = searchParams.get('gender');

  let query = supabase
    .from('products')
    .select('*, product_images(image_url, sort_order)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (gender) query = query.eq('gender', gender);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/products — protected, only authenticated admin users
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user has admin role in DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, slug, description, price, category, gender, imageUrl } = body;

  if (!title || !slug || !price || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({ title, slug, description, price: parseFloat(price), category, gender: gender || 'unisex', status: 'active' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (imageUrl && product) {
    await supabase.from('product_images').insert({ product_id: product.id, image_url: imageUrl, sort_order: 0 });
  }

  return NextResponse.json(product, { status: 201 });
}
