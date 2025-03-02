import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/mood-selection', request.url));
  } catch (e) {
    console.error('Auth callback error:', e);
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
  }
} 