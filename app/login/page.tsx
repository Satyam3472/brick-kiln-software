import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
            <div className="w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">
                        🧱 Brick Kiln
                    </h1>
                    <p className="text-muted-foreground">Management System</p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle>Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />

                        <div className="mt-6 text-xs text-center text-muted-foreground space-y-1">
                            <p className="font-semibold">Default Credentials:</p>
                            <p>Admin: admin@brickiln.com / Admin@123</p>
                            <p>Manager: manager@brickiln.com / Manager@123</p>
                            <p>Staff: staff@brickiln.com / Staff@123</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
