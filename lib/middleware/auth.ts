import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { Role } from '@prisma/client';

/**
 * Middleware to protect API routes
 * Verifies JWT token and checks if user has required role
 */
export function requireAuth(allowedRoles: Role[] = []) {
    return async (
        request: NextRequest,
        handler: (request: NextRequest, user: any) => Promise<NextResponse>
    ) => {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify token
        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Check if user has required role
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as Role)) {
            return NextResponse.json(
                { success: false, message: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Call the actual handler with user data
        return handler(request, user);
    };
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}
