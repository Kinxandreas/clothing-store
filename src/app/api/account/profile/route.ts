import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ profile: data ?? {} });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { full_name, phone, address_line1, address_line2, city, postal_code, country } = body;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: full_name ?? null,
      phone: phone ?? null,
      address_line1: address_line1 ?? null,
      address_line2: address_line2 ?? null,
      city: city ?? null,
      postal_code: postal_code ?? null,
      country: country ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
