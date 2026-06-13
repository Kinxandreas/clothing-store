import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const context = req.nextUrl.searchParams.get('context'); // 'shop' | 'collections' | null

  let query = supabase
    .from('categories')
    .select('id, name, slug, show_in')
    .order('sort_order');

  // If context supplied, only return categories that include it in their show_in array
  if (context) {
    query = query.contains('show_in', [context]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
