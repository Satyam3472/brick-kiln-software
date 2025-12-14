'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LedgerEntry {
    id: string;
    date: string;
    type: string;
    amount: number;
    note: string | null;
}

interface LedgerSummary {
    totalEarnings: number;
    totalDeductions: number;
    balance: number;
}

export default function DriverLedgerPage({ params }: { params: { id: string } }) {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [summary, setSummary] = useState<LedgerSummary>({ totalEarnings: 0, totalDeductions: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [driverName, setDriverName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'salary_entry',
        amount: '',
        note: ''
    });

    const fetchLedger = useCallback(async () => {
        try {
            const res = await fetch(`/api/driver-salary/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setEntries(data.entries);
                setSummary(data.summary);
                // We might want to fetch driver name separately or include it in response
            } else {
                toast({ title: 'Error', description: data.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch ledger', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [params.id, toast]);

    // Fetch driver name
    useEffect(() => {
        const fetchDriver = async () => {
            const res = await fetch(`/api/drivers/${params.id}`);
            const data = await res.json();
            if (data.success) setDriverName(data.driver.name);
        }
        fetchDriver();
    }, [params.id]);


    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const handleSubmit = async () => {
        try {
            const res = await fetch('/api/driver-salary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverId: params.id,
                    date: formData.date,
                    type: formData.type,
                    amount: parseFloat(formData.amount),
                    note: formData.note
                })
            });

            const data = await res.json();
            if (data.success) {
                toast({ title: 'Success', description: 'Entry added' });
                setIsDialogOpen(false);
                setFormData({ ...formData, amount: '', note: '' }); // Reset form
                fetchLedger();
            } else {
                toast({ title: 'Error', description: data.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add entry', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Driver Ledger</h1>
                    <p className="text-muted-foreground">{driverName}</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="text-right mr-4">
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className={`text-xl font-bold ${summary.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            ₹{summary.balance.toFixed(2)}
                        </div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Ledger Entry</DialogTitle>
                                <DialogDescription>
                                    Record a salary, advance, or payment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">
                                        Date
                                    </Label>
                                    <Input id="date" type="date" className="col-span-3" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">
                                        Type
                                    </Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="salary_entry">Salary Entry</SelectItem>
                                            <SelectItem value="advance">Advance</SelectItem>
                                            <SelectItem value="payment">Payment</SelectItem>
                                            <SelectItem value="bonus">Bonus</SelectItem>
                                            <SelectItem value="penalty">Penalty</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">
                                        Amount
                                    </Label>
                                    <Input id="amount" type="number" className="col-span-3" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="note" className="text-right">
                                        Note
                                    </Label>
                                    <Input id="note" className="col-span-3" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={handleSubmit}>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">Total Earnings (Salary + Bonus)</div>
                    <div className="text-2xl font-bold">₹{summary.totalEarnings.toFixed(2)}</div>
                </div>
                <div className="p-4 border rounded-md">
                    <div className="text-sm text-muted-foreground">Total Deductions (Paid + Adv + Penalty)</div>
                    <div className="text-2xl font-bold">₹{summary.totalDeductions.toFixed(2)}</div>
                </div>
                <div className="p-4 border rounded-md bg-muted/20">
                    <div className="text-sm text-muted-foreground">Net Balance</div>
                    <div className="text-2xl font-bold">₹{summary.balance.toFixed(2)}</div>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : entries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No entries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            entries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="capitalize">{entry.type.replace('_', ' ')}</TableCell>
                                    <TableCell>{entry.note || '-'}</TableCell>
                                    <TableCell className="text-right font-medium">₹{entry.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
