import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { getCustomerPendingReports } from '@/lib/actions/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export default async function PendingBalanceReportPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token.value);

    // Allow Admin and Manager to view reports
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
        redirect('/unauthorized');
    }

    const reports = await getCustomerPendingReports();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Pending Balance Report</h1>
                <p className="text-muted-foreground">
                    Detailed breakdown of all unpaid sales by customer.
                </p>
            </div>

            {reports.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-48 py-8">
                        <div className="rounded-full bg-green-100 p-4 mb-4">
                            <AlertCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-1">No Pending Dues</h3>
                        <p className="text-muted-foreground text-center">Great job! All customers have cleared their balances.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {reports.map((customerReport) => (
                        <Card key={customerReport.customerId} className="overflow-hidden border-l-4 border-l-orange-500">
                            <CardHeader className="bg-slate-50/50 pb-4">
                                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {customerReport.customerName}
                                            {customerReport.customerPhone && (
                                                <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                                                    {customerReport.customerPhone}
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            Total Outstanding Balance
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-red-600">
                                            ₹{customerReport.totalPending.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                <TableHead className="w-[120px]">Date</TableHead>
                                                <TableHead>Chalan No</TableHead>
                                                <TableHead>Brick Type</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                                <TableHead className="text-right">Rate</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Paid</TableHead>
                                                <TableHead className="text-right font-bold text-red-600">Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customerReport.sales.map((sale) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell className="font-medium">
                                                        {format(new Date(sale.date), 'dd/MM/yyyy')}
                                                    </TableCell>
                                                    <TableCell>{sale.chalanNo}</TableCell>
                                                    <TableCell>{sale.brickType}</TableCell>
                                                    <TableCell className="text-right">{sale.quantity}</TableCell>
                                                    <TableCell className="text-right">₹{sale.rate}</TableCell>
                                                    <TableCell className="text-right">₹{sale.amount.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-green-600">₹{sale.paid.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-bold text-red-600">
                                                        ₹{sale.balance.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
