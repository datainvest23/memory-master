import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware auth error:', error);
    }

    // Handle public routes
    const isPublicRoute = 
      req.nextUrl.pathname === '/login' ||
      req.nextUrl.pathname === '/register' ||
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/api/auth') ||
      req.nextUrl.pathname === '/auth/callback';

    // If no session and trying to access protected route
    if (!session && !isPublicRoute) {
      console.log('No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If has session and trying to access login/register
    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
      console.log('Session exists, redirecting to mood selection');
      return NextResponse.redirect(new URL('/mood-selection', req.url));
    }

    return res;
  } catch (e) {
    console.error('Middleware error:', e);
    // On error, allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 