import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { id } = await params;
  const body = await req.json();

  // Strip image_url — it belongs in product_images, not products
  const { image_url, ...productPayload } = body;

  const { data, error } = await supabase
    .from('products')
    .update(productPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Upsert or remove the sort_order:0 image row in product_images
  if (image_url) {
    await supabase
      .from('product_images')
      .upsert(
        [{ product_id: id, image_url, sort_order: 0 }],
        { onConflict: 'product_id,sort_order' }
      );
  } else if (image_url === null) {
    // Caller explicitly cleared the image
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)
      .eq('sort_order', 0);
  }

  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceSupabase();
  const { id } = await params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
