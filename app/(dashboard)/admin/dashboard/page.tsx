import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BarChart3, Settings, Package, IndianRupee } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { SalesOverviewChart } from '@/components/dashboard/sales-chart';
import { getDashboardStats, getSalesChartData } from '@/lib/actions/dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    // Strict role check for Admin Dashboard
    if (!user || user.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Fetch dynamic data
    const stats = await getDashboardStats();
    const chartData = await getSalesChartData();

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        {currentDate}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <i className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                    <Button size="sm">
                        <Link href="/sales/create">New Sale</Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                // Trend calculation would require historic data, skipping for now
                />
                <StatsCard
                    title="Active Users"
                    value={stats.activeUsers.toString()}
                    icon={Users}
                />
                <StatsCard
                    title="Total Bricks Sold"
                    value={stats.totalBricksSold.toLocaleString()}
                    description="Lifetime sales"
                    icon={Package}
                />
                <StatsCard
                    title="Unpaid Sales"
                    value={stats.unpaidSalesCount.toString()}
                    description="Requires collection"
                    icon={BarChart3}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <SalesOverviewChart data={chartData} />

                {/* Right Column: Quick Actions / Recent Activity */}
                <Card className="col-span-1 hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/admin/users/create">
                                <Users className="mr-2 h-4 w-4" /> Add User
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/sales">
                                <BarChart3 className="mr-2 h-4 w-4" /> View Sales
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" /> System Settings
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <Users className="h-8 w-8 text-blue-600 mb-2" />
                        <CardTitle className="text-blue-900">User Management</CardTitle>
                        <CardDescription className="text-blue-700/80">
                            Create and manage user accounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 border-none">
                            <Link href="/admin/users">Manage Users</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <BarChart3 className="h-8 w-8 text-emerald-600 mb-2" />
                        <CardTitle className="text-emerald-900">Reports</CardTitle>
                        <CardDescription className="text-emerald-700/80">
                            View detailed analytics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 border-none">
                            <Link href="/admin/reports/pending-balance">View Reports</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <Settings className="h-8 w-8 text-violet-600 mb-2" />
                        <CardTitle className="text-violet-900">Configuration</CardTitle>
                        <CardDescription className="text-violet-700/80">
                            Price settings & backup
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-violet-600 hover:bg-violet-700 border-none">
                            Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
