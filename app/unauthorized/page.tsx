'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
            <Card className="w-full max-w-md mx-4 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                    <CardDescription>
                        You don&apos;t have permission to access this page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        This page is restricted to specific user roles. Please contact your
                        administrator if you believe you should have access.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href="/login">Go to Login</Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
