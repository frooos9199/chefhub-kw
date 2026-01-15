import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// المسارات المحمية
const protectedRoutes = {
  customer: ['/checkout', '/settings'],
  chef: ['/chef'],
  admin: ['/admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // السماح بالوصول للملفات الثابتة وAPI
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // TODO: إضافة فحص JWT token من cookies
  // const token = request.cookies.get('session')?.value;
  // if (!token && needsAuth(pathname)) {
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
