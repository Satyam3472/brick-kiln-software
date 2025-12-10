import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { canAccessRoute, getDefaultDashboard } from '@/lib/auth/permissions';
import { Role } from '@prisma/client';

// Routes that don't require authentication
const publicRoutes = ['/login', '/unauthorized'];

// Routes that should redirect authenticated users
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    // Verify token and get user data
    const user = token ? await verifyToken(token) : null;

    // If user is authenticated and tries to access auth routes (like /login)
    // redirect them to their dashboard
    if (user && authRoutes.some((route) => pathname.startsWith(route))) {
        const dashboard = getDefaultDashboard(user.role as Role);
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // If route is public, allow access
    if (publicRoutes.some((route) => pathname === route)) {
        return NextResponse.next();
    }

    // Check if route requires authentication
    const requiresAuth =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/manager') ||
        pathname.startsWith('/staff');

    // If route requires auth but user is not authenticated
    if (requiresAuth && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated, check role-based permissions
    if (user && requiresAuth) {
        const hasAccess = canAccessRoute(pathname, user.role as Role);

        if (!hasAccess) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

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
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
