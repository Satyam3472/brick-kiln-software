import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getDefaultDashboard } from '@/lib/auth/permissions';
import { Role } from '@prisma/client';

export default async function DashboardRedirect() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    if (!user) {
        redirect('/login');
    }

    // Redirect to the specific dashboard for the role
    const dashboardUrl = getDefaultDashboard(user.role as Role);
    redirect(dashboardUrl);
}
