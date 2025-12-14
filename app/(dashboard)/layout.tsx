import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    if (!user) {
        redirect('/login');
    }

    // Pass user.role to the shell for Sidebar/Header Customization
    return (
        <DashboardShell userRole={user.role} userName={user.email}>
            {children}
        </DashboardShell>
    );
}
