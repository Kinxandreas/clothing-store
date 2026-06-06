import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/me — get current user session (server-side)
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: profile?.role || 'customer',
      full_name: profile?.full_name || null,
    }
  });
}
