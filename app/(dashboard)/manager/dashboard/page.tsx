import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { Navbar } from '@/components/layout/navbar';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, FileText, IndianRupee } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/ui/button';

export default async function ManagerDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
        redirect('/unauthorized');
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manager Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Operational overview and daily metrics
                </p>
            </div>

            {/* Operations Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Today's Sales"
                    value="₹12,450"
                    trend={{ value: 5.2, label: "vs yesterday", positive: true }}
                    icon={IndianRupee}
                />
                <StatsCard
                    title="Daily Expenses"
                    value="₹3,200"
                    trend={{ value: 1.2, label: "vs yesterday", positive: false }}
                    icon={FileText}
                />
                <StatsCard
                    title="Net Profit"
                    value="₹9,250"
                    trend={{ value: 8.5, label: "margin", positive: true }}
                    icon={TrendingUp}
                />
            </div>

            {/* Quick Access Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                    <CardHeader>
                        <TrendingUp className="h-8 w-8 text-indigo-600 mb-2" />
                        <CardTitle className="text-indigo-900">Sales Management</CardTitle>
                        <CardDescription className="text-indigo-700/80">
                            Record and track sales transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Link href="/sales">Go to Sales</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100">
                    <CardHeader>
                        <IndianRupee className="h-8 w-8 text-rose-600 mb-2" />
                        <CardTitle className="text-rose-900">Expense Tracking</CardTitle>
                        <CardDescription className="text-rose-700/80">
                            Monitor and categorize expenses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" disabled>
                            Manage Expenses
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
                    <CardHeader>
                        <FileText className="h-8 w-8 text-teal-600 mb-2" />
                        <CardTitle className="text-teal-900">Reports</CardTitle>
                        <CardDescription className="text-teal-700/80">
                            Generate financial reports
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                            <Link href="/admin/reports/pending-balance">View Reports</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
