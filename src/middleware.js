import { NextResponse } from 'next/server';

export function middleware(request) {
  const authCookie = request.cookies.get('auth-storage');
  const pathname = request.nextUrl.pathname;

  // Protected routes
  const protectedRoutes = {
    '/admin/dashboard': 'admin',
    '/penjual/dashboard': 'penjual',
  };

  // Check if current path needs protection
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    // Check if user is authenticated
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const authData = JSON.parse(authCookie.value);
      const user = authData?.state?.user;

      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check role-based access
      for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route) && user.role !== requiredRole) {
          // Redirect to appropriate dashboard
          if (user.role === 'admin') {
            return NextResponse.redirect(
              new URL('/admin/dashboard', request.url),
            );
          } else if (user.role === 'penjual') {
            return NextResponse.redirect(
              new URL('/penjual/dashboard', request.url),
            );
          } else {
            return NextResponse.redirect(new URL('/', request.url));
          }
        }
      }
    } catch (error) {
      // If cookie parsing fails, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/penjual/dashboard/:path*'],
};
