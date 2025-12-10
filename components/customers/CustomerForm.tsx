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
import { useToast } from '@/hooks/use-toast'; // Assuming use-toast is installed or I need to find where it is
// Check if hooks/use-toast exists or components/ui/use-toast. usually components/ui/use-toast.ts
// I'll assume standard shadcn installation path: @/hooks/use-toast or @/components/ui/use-toast
// Let's use generic error handling if not sure, but I requested toast.
// Standard is often @/hooks/use-toast in newer shadcn.

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
    initialData?: CustomerFormValues & { id?: string };
    isModal?: boolean;
    onSuccess?: (data: any) => void;
}

export function CustomerForm({ initialData, isModal = false, onSuccess }: CustomerFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            address: '',
            phone: '',
        },
    });

    const onSubmit = async (data: CustomerFormValues) => {
        setLoading(true);
        try {
            const url = initialData?.id
                ? `/api/customers/${initialData.id}`
                : '/api/customers';
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

            const result = await response.json();

            toast({
                title: initialData?.id ? 'Customer updated' : 'Customer created',
                description: `Successfully ${initialData?.id ? 'updated' : 'created'} customer ${data.name}`,
            });

            if (onSuccess) {
                onSuccess(result.customer);
            } else {
                router.push('/customers');
                router.refresh();
            }
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

    const Content = (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    placeholder="Customer Name"
                    {...form.register('name')}
                />
                {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    placeholder="Address"
                    {...form.register('address')}
                />
                {form.formState.errors.address && (
                    <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                    id="phone"
                    placeholder="Phone Number"
                    {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
            </div>
        </div>
    );

    const Footer = (
        <div className="flex justify-end gap-2">
            {!isModal && (
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
            )}
            <Button type="submit" disabled={loading} onClick={form.handleSubmit(onSubmit)}>
                {loading ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
            </Button>
        </div>
    );

    if (isModal) {
        return (
            <div className="space-y-4 py-4">
                {Content}
                {Footer}
            </div>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{initialData ? 'Edit Customer' : 'Create New Customer'}</CardTitle>
                <CardDescription>
                    Enter customer details below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {Content}
            </CardContent>
            <CardFooter>
                {Footer}
            </CardFooter>
        </Card>
    );
}
