import { Role } from '@prisma/client';

/**
 * Check if a role can access admin routes
 */
export function canAccessAdminRoutes(role: Role): boolean {
    return role === 'ADMIN';
}

/**
 * Check if a role can access manager routes
 */
export function canAccessManagerRoutes(role: Role): boolean {
    return role === 'ADMIN' || role === 'MANAGER';
}

/**
 * Check if a role can access staff routes
 */
export function canAccessStaffRoutes(role: Role): boolean {
    return role === 'ADMIN' || role === 'MANAGER' || role === 'STAFF';
}

/**
 * Get the default dashboard route for a role
 */
export function getDefaultDashboard(role: Role): string {
    switch (role) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'MANAGER':
            return '/manager/dashboard';
        case 'STAFF':
            return '/staff/entry';
        default:
            return '/login';
    }
}

/**
 * Check if a user can access a specific route based on their role
 */
export function canAccessRoute(route: string, role: Role): boolean {
    if (route.startsWith('/admin')) {
        return canAccessAdminRoutes(role);
    }
    if (route.startsWith('/manager')) {
        return canAccessManagerRoutes(role);
    }
    if (route.startsWith('/staff')) {
        return canAccessStaffRoutes(role);
    }
    return true; // Public routes
}
