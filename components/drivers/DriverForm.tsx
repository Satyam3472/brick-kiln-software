'use client';

import { useState } from 'react';
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
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    vehicleNumber: z.string().optional(),
    monthlySalary: z.coerce.number().nonnegative().optional(),
});

type DriverFormValues = z.infer<typeof formSchema>;

interface DriverFormProps {
    initialData?: DriverFormValues & { id?: string };
}

export function DriverForm({ initialData }: DriverFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<DriverFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            phone: '',
            vehicleNumber: '',
            monthlySalary: undefined,
        },
    });

    const onSubmit = async (data: DriverFormValues) => {
        setLoading(true);
        try {
            const url = initialData?.id
                ? `/api/drivers/${initialData.id}`
                : '/api/drivers';
            const method = initialData?.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong');
            }

            toast({
                title: initialData?.id ? 'Driver updated' : 'Driver created',
                description: `Successfully ${initialData?.id ? 'updated' : 'created'} driver`,
            });

            router.push('/drivers');
            router.refresh();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{initialData ? 'Edit Driver' : 'New Driver'}</CardTitle>
                <CardDescription>Enter driver details.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Driver Name"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                            id="phone"
                            placeholder="Phone Number"
                            {...form.register('phone')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                        <Input
                            id="vehicleNumber"
                            placeholder="e.g. KA-01-AB-1234"
                            {...form.register('vehicleNumber')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="monthlySalary">Monthly Salary</Label>
                        <Input
                            id="monthlySalary"
                            type="number"
                            placeholder="0.00"
                            {...form.register('monthlySalary')}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                </Button>
            </CardFooter>
        </Card>
    );
}
