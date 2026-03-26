// import { withAuth } from 'next-auth/middleware';

// /**
//  * Protects /register/onboarding and /dashboard from unauthorised access.
//  * Unauthenticated users are redirected to the sign-in page (/login).
//  */
// export default withAuth({
//   pages: {
//     signIn: '/login',
//   },
// });

// export const config = {
//   matcher: [
//     '/register/onboarding/:path*',
//     '/dashboard/:path*',
//   ],
// };
// Restrict access to all API endpoints under /api for everyone
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Prevent access to /api/* (including routes under /app/api)
  if (pathname.startsWith('/api/')) {
    return new NextResponse('Not Found', { status: 404 });
  }
  // Let other middleware/auth rules run for other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // '/api/:path*',
    '/register/onboarding/:path*',
    '/VCSE/dashboard/:path*',
    '/Corporate/dashboard/:path*',
  ],
};