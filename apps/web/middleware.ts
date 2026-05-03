import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('kon_token')?.value;
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardPage && !token) {
    // In a real app, we might want to verify the token server-side
    // For now, if we don't have a token cookie, we redirect to login
    // Note: Our current login logic uses localStorage, but for middleware we need cookies
    // I'll update the login logic to also set a cookie.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
