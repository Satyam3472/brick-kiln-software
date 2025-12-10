'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    description: z.string().optional(),
    rateDefault: z.coerce.number().positive().optional(),
});

type BrickTypeFormValues = z.infer<typeof formSchema>;

interface BrickTypeFormProps {
    initialData?: BrickTypeFormValues & { id?: string };
}

export function BrickTypeForm({ initialData }: BrickTypeFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<BrickTypeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            description: '',
            rateDefault: undefined,
        },
    });

    const onSubmit = async (data: BrickTypeFormValues) => {
        setLoading(true);
        try {
            const url = initialData?.id
                ? `/api/brick-types/${initialData.id}`
                : '/api/brick-types';
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
                title: initialData?.id ? 'Brick Type updated' : 'Brick Type created',
                description: `Successfully ${initialData?.id ? 'updated' : 'created'} brick type`,
            });

            router.push('/brick-types');
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
                <CardTitle>{initialData ? 'Edit Brick Type' : 'New Brick Type'}</CardTitle>
                <CardDescription>Define brick types and default rates.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Red Brick"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Optional description"
                            {...form.register('description')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rateDefault">Default Rate</Label>
                        <Input
                            id="rateDefault"
                            type="number"
                            placeholder="0.00"
                            {...form.register('rateDefault')}
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
