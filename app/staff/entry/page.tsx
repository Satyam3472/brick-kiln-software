import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { Navbar } from '@/components/layout/navbar';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Users2, Calendar } from 'lucide-react';

export default async function StaffEntryPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    if (!user) {
        redirect('/unauthorized');
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar userName={user?.email || 'User'} userRole={user.role} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Data Entry</h1>
                    <p className="text-muted-foreground mt-2">
                        Select an action to begin
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 hover:scale-[1.02]">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                <ClipboardList className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">New Sale</CardTitle>
                            <CardDescription>
                                Register a new brick sale
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full h-12 text-lg" size="lg">
                                <Link href="/sales/create">Enter Sale</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-orange-500 hover:scale-[1.02]">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                                <ClipboardList className="h-6 w-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-xl">Record Expense</CardTitle>
                            <CardDescription>
                                Log daily operational costs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full h-12 text-lg border-orange-200 hover:bg-orange-50 hover:text-orange-700" size="lg">
                                Add Expense
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500 hover:scale-[1.02]">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-xl">Attendance</CardTitle>
                            <CardDescription>
                                Mark daily worker attendance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full h-12 text-lg border-green-200 hover:bg-green-50 hover:text-green-700" size="lg">
                                Mark Attendance
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Section */}
                <div className="mt-12">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <ClipboardList className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Sale Recorded</p>
                                                <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">₹12,400</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
