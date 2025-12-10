'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface NavbarProps {
    userName: string;
    userRole: string;
}

export function Navbar({ userName, userRole }: NavbarProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });

            router.push('/login');
            router.refresh();
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-primary mr-4">
                            🧱 Brick Kiln Management
                        </h1>

                        <div className="hidden md:flex gap-4">
                            <a href="/sales" className="text-sm font-medium hover:text-primary transition-colors">Sales</a>

                            {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                                <>
                                    <a href="/customers" className="text-sm font-medium hover:text-primary transition-colors">Customers</a>
                                    <a href="/drivers" className="text-sm font-medium hover:text-primary transition-colors">Drivers</a>
                                </>
                            )}

                            {userRole === 'ADMIN' && (
                                <a href="/brick-types" className="text-sm font-medium hover:text-primary transition-colors">Brick Types</a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium">{userName}</p>
                            <p className="text-xs text-muted-foreground">{userRole}</p>
                        </div>
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
