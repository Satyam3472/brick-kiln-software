import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserForm } from '@/components/users/user-form';

async function getUser(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        return null;
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/users/${id}`, {
            headers: {
                Cookie: `auth-token=${token.value}`,
            },
            cache: 'no-store',
        });

        const data = await response.json();
        return data.success ? data.user : null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export default async function EditUserPage({
    params,
}: {
    params: { id: string };
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const currentUser = await verifyToken(token.value);

    if (!currentUser || currentUser.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    const userToEdit = await getUser(params.id);

    if (!userToEdit) {
        redirect('/admin/users');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
            <Navbar userName={currentUser.email} userRole={currentUser.role} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                    <p className="text-muted-foreground mt-2">
                        Update user information
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>
                            Make changes to the user account below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserForm mode="edit" user={userToEdit} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
