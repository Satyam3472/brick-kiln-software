'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'; // Need to make select dynamic for filters later if needed
import { useToast } from '@/hooks/use-toast';
import { Plus, Filter } from 'lucide-react';

interface Sale {
    id: string;
    date: string;
    customer: { name: string };
    brickType: { name: string };
    quantity: number;
    rate: number;
    amount: number;
    paid: number;
    balance: number;
    driver: { name: string };
    chalanNo: string;
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Filter States
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [unpaid, setUnpaid] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Customers and Drivers for filter dropdowns (Optional - for now using text or simple)

    const fetchSales = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            // Example of boolean
            if (unpaid) queryParams.append('unpaid', 'true');

            const res = await fetch(`/api/sales?${queryParams.toString()}`);
            const data = await res.json();

            if (data.success) {
                setSales(data.sales);
                setTotalPages(data.pagination.pages);
            } else {
                if (data.message === 'Access denied') {
                    // Handle gracefully
                } else {
                    toast({ title: 'Error', description: data.message, variant: 'destructive' });
                }
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch sales', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [page, startDate, endDate, unpaid, toast]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Sales</h1>

                <div className="flex gap-2">
                    {/* Add Sale Button */}
                    <Link href="/sales/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Sale
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-md bg-muted/10 items-end">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pb-2">
                    {/* Checkbox for unpaid? Using button for now or custom */}
                    <Button variant={unpaid ? "default" : "outline"} onClick={() => setUnpaid(!unpaid)} size="sm">
                        {unpaid ? "Unpaid Only" : "Show All"}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Chalan</TableHead>
                            <TableHead>Brick Type</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead>Driver</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">No sales found.</TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{sale.customer.name}</TableCell>
                                    <TableCell>{sale.chalanNo}</TableCell>
                                    <TableCell>{sale.brickType.name}</TableCell>
                                    <TableCell className="text-right">{sale.quantity}</TableCell>
                                    <TableCell className="text-right">{sale.rate}</TableCell>
                                    <TableCell className="text-right">{sale.amount}</TableCell>
                                    <TableCell className="text-right">{sale.paid}</TableCell>
                                    <TableCell className={`text-right font-bold ${sale.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {sale.balance}
                                    </TableCell>
                                    <TableCell>{sale.driver.name}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>Previous</Button>
                <div className="flex items-center text-sm">Page {page} of {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</Button>
            </div>
        </div>
    );
}
