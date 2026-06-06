import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    console.error('Email confirmation error:', error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // Successfully verified — redirect to intended page
  return NextResponse.redirect(new URL(next, request.url));
}
