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

// GET /api/admin/products/[id]/variants
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServiceSupabase();
  const { id } = await params;
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/products/[id]/variants  — body: { label, value, sort_order? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServiceSupabase();
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase
    .from('product_variants')
    .insert([{ product_id: id, label: body.label, value: body.value, sort_order: body.sort_order ?? 0 }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT /api/admin/products/[id]/variants  — full replace: body: { variants: [{label,value,sort_order}] }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServiceSupabase();
  const { id } = await params;
  const { variants } = await req.json() as { variants: { label: string; value: string; sort_order: number }[] };
  // Delete all existing then insert fresh
  await supabase.from('product_variants').delete().eq('product_id', id);
  if (variants && variants.length > 0) {
    const rows = variants.map((v, i) => ({ product_id: id, label: v.label, value: v.value, sort_order: i }));
    const { error } = await supabase.from('product_variants').insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data } = await supabase.from('product_variants').select('*').eq('product_id', id).order('sort_order');
  return NextResponse.json(data ?? []);
}
