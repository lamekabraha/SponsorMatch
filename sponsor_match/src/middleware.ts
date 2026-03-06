import { withAuth } from 'next-auth/middleware';

/**
 * Protects /register/onboarding and /dashboard from unauthorised access.
 * Unauthenticated users are redirected to the sign-in page (/login).
 */
export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/register/onboarding/:path*',
    '/dashboard/:path*',
  ],
};
