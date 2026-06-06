import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/orders — create an order (authenticated users only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized — please log in to place an order' }, { status: 401 });
  }

  const body = await request.json();
  const { items, total, shipping_address } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  // Verify prices server-side — never trust client prices
  const productIds = items.map((i: { product_id: string }) => i.product_id);
  const { data: products } = await supabase
    .from('products')
    .select('id, price, status')
    .in('id', productIds)
    .eq('status', 'active');

  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });
  }

  // Recalculate total server-side
  const serverTotal = items.reduce((sum: number, item: { product_id: string; quantity: number }) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  if (Math.abs(serverTotal - total) > 0.01) {
    return NextResponse.json({ error: 'Price mismatch — please refresh your cart' }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total: serverTotal,
      status: 'pending',
      shipping_address,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert order items
  const orderItems = items.map((item: { product_id: string; quantity: number; size?: string }) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    size: item.size || null,
    price: products.find(p => p.id === item.product_id)?.price,
  }));

  await supabase.from('order_items').insert(orderItems);

  return NextResponse.json({ order_id: order.id, total: serverTotal }, { status: 201 });
}

// GET /api/orders — get current user's orders
export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(title, product_images(image_url)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
