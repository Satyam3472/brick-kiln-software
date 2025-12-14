'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CustomerForm } from '@/components/customers/CustomerForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

// Form Schema
const formSchema = z.object({
    date: z.string(),
    customerId: z.string().min(1, 'Customer is required'),
    driverId: z.string().min(1, 'Driver is required'),
    brickTypeId: z.string().min(1, 'Brick Type is required'),
    chalanNo: z.string().min(1, 'Chalan No is required'),
    quantity: z.coerce.number().positive('Quantity must be positive'),
    rate: z.coerce.number().positive('Rate must be positive'),
    paid: z.coerce.number().min(0),
});

type SaleFormValues = z.infer<typeof formSchema>;

export default function CreateSalePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Dropdown Data
    const [customers, setCustomers] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [brickTypes, setBrickTypes] = useState<any[]>([]);

    // Auto-calc state
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    // Dialog state for new customer
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            customerId: '',
            driverId: '',
            brickTypeId: '',
            chalanNo: '',
            quantity: 0,
            rate: 0,
            paid: 0,
        },
    });

    // Watch fields for calculation
    const quantity = form.watch('quantity');
    const rate = form.watch('rate');
    const paid = form.watch('paid');
    const selectedBrickTypeId = form.watch('brickTypeId');

    // Fetch Master Data
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [custRes, drivRes, brickRes] = await Promise.all([
                    fetch('/api/customers'),
                    fetch('/api/drivers'),
                    fetch('/api/brick-types')
                ]);

                const custData = await custRes.json();
                const drivData = await drivRes.json();
                const brickData = await brickRes.json();

                if (custData.success) setCustomers(custData.customers);
                if (drivData.success) setDrivers(drivData.drivers);
                if (brickData.success) setBrickTypes(brickData.brickTypes);

            } catch (error) {
                console.error("Failed to load master data");
                toast({ title: "Error", description: "Failed to load master data", variant: "destructive" });
            }
        };
        fetchMasterData();
    }, [toast]);

    // Auto-set Rate when Brick Type Changes
    useEffect(() => {
        if (selectedBrickTypeId) {
            const brick = brickTypes.find(b => b.id === selectedBrickTypeId);
            if (brick && brick.rateDefault) {
                form.setValue('rate', brick.rateDefault);
                // Also update amount if qty exists
                const qty = form.getValues('quantity');
                if (qty) {
                    setAmount(qty * brick.rateDefault);
                }
            }
        }
    }, [selectedBrickTypeId, brickTypes, form]);

    // Auto-Calculate Logic
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const qty = Number(e.target.value);
        form.setValue('quantity', qty);
        const currentRate = form.getValues('rate');
        if (qty && currentRate) {
            setAmount(qty * currentRate);
        }
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const r = Number(e.target.value);
        form.setValue('rate', r);
        const currentQty = form.getValues('quantity');
        if (currentQty && r) {
            setAmount(currentQty * r);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = Number(e.target.value);
        setAmount(newAmount);
        const currentQty = form.getValues('quantity');
        if (currentQty && newAmount) {
            const calculatedRate = newAmount / currentQty;
            form.setValue('rate', parseFloat(calculatedRate.toFixed(2)));
        }
    };

    // Update balance when amount or paid changes
    useEffect(() => {
        const paidVal = Number(paid) || 0;
        setBalance(amount - paidVal);
    }, [amount, paid]);

    const onSubmit = async (data: SaleFormValues) => {
        setLoading(true);
        try {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            toast({ title: 'Success', description: 'Sale recorded successfully' });
            router.push('/sales');
            router.refresh(); // Refresh list
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Callback when new customer is added via Modal
    const handleCustomerAdded = (newCustomer: any) => {
        setCustomers(prev => [newCustomer, ...prev]);
        form.setValue('customerId', newCustomer.id);
        setIsCustomerModalOpen(false);
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>New Sale Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" {...form.register('date')} />
                            </div>

                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <div className="flex gap-2">
                                    <Select
                                        onValueChange={(val) => form.setValue('customerId', val)}
                                        value={form.watch('customerId')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" type="button"><Plus className="h-4 w-4" /></Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Add New Customer</DialogTitle>
                                            </DialogHeader>
                                            <CustomerForm isModal onSuccess={handleCustomerAdded} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                {form.formState.errors.customerId && <p className="text-red-500 text-sm">{form.formState.errors.customerId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Chalan No</Label>
                                <Input placeholder="Enter Chalan No" {...form.register('chalanNo')} />
                                {form.formState.errors.chalanNo && <p className="text-red-500 text-sm">{form.formState.errors.chalanNo.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Driver</Label>
                                <Select
                                    onValueChange={(val) => form.setValue('driverId', val)}
                                    value={form.watch('driverId')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Driver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.driverId && <p className="text-red-500 text-sm">{form.formState.errors.driverId.message}</p>}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Brick Type</Label>
                                <Select
                                    onValueChange={(val) => form.setValue('brickTypeId', val)}
                                    value={form.watch('brickTypeId')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Brick Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brickTypes.map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.brickTypeId && <p className="text-red-500 text-sm">{form.formState.errors.brickTypeId.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        {...form.register('quantity')}
                                        onChange={(e) => {
                                            form.register('quantity').onChange(e);
                                            handleQuantityChange(e);
                                        }}
                                    />
                                    {form.formState.errors.quantity && <p className="text-red-500 text-sm">{form.formState.errors.quantity.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Rate</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...form.register('rate')}
                                        onChange={(e) => {
                                            form.register('rate').onChange(e);
                                            handleRateChange(e);
                                        }}
                                    />
                                    {form.formState.errors.rate && <p className="text-red-500 text-sm">{form.formState.errors.rate.message}</p>}
                                </div>
                            </div>

                            <div className="p-4 bg-muted rounded-md space-y-2">
                                <div className="flex justify-between items-center text-lg font-medium">
                                    <span>Total Amount:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">₹</span>
                                        <Input
                                            type="number"
                                            value={amount || ''}
                                            onChange={handleAmountChange}
                                            className="w-32 text-right font-bold bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Paid Amount</Label>
                                <Input type="number" step="0.01" {...form.register('paid')} />
                            </div>

                            <div className={`p-4 rounded-md border ${balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Balance Due:</span>
                                    <span className={balance > 0 ? 'text-red-700' : 'text-green-700'}>₹{balance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                        {loading ? 'Processing...' : 'Save Sale'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
