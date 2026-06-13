import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Service role client — bypasses RLS for admin data reads/writes
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Auth client — used only to verify the session/user
async function getAuthSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

async function requireAdmin() {
  const authClient = await getAuthSupabase();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;
  const serviceClient = getServiceSupabase();
  const { data } = await serviceClient.from('admins').select('id').eq('id', user.id).single();
  return data ? user : null;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(image_url, sort_order)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten the first image URL so the admin thumbnail can read it directly
  const products = (data ?? []).map((p: Record<string, unknown> & { product_images?: { image_url: string; sort_order: number }[] }) => {
    const images = p.product_images ?? [];
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
    return { ...p, image_url: sorted[0]?.image_url ?? null };
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const body = await req.json();

  // Strip image_url — it belongs in product_images, not products
  const { image_url, ...productPayload } = body;

  const { data, error } = await supabase
    .from('products')
    .insert([productPayload])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert the primary image into product_images
  if (image_url && data?.id) {
    await supabase.from('product_images').insert([
      { product_id: data.id, image_url, sort_order: 0 },
    ]);
  }

  return NextResponse.json(data);
}
