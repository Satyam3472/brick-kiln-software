import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserForm } from '@/components/users/user-form';

export default async function CreateUserPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    if (!user || user.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
            <Navbar userName={user.email} userRole={user.role} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
                    <p className="text-muted-foreground mt-2">
                        Add a new user to the system
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>
                            Fill in the information below to create a new user account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserForm mode="create" />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
