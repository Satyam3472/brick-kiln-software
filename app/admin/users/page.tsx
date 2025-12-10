import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserTable } from '@/components/users/user-table';
import { Plus } from 'lucide-react';

async function getUsers() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        return [];
    }

    try {
        // In server component, we make an internal API call
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/users`, {
            headers: {
                Cookie: `auth-token=${token.value}`,
            },
            cache: 'no-store',
        });

        const data = await response.json();
        return data.success ? data.users : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export default async function UsersPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    if (!user || user.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    const users = await getUsers();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
            <Navbar userName={user.email} userRole={user.role} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage all users in the system
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create User
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                            A list of all users including their name, email, role and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserTable users={users} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
