'use client';

import { useEffect, useState } from 'react';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EditCustomerPage({ params }: { params: { id: string } }) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`/api/customers/${params.id}`); // This endpoint doesn't exist yet? Wait, GET /api/customers/[id] was not created? 
                // I created GET /api/customers, created PUT /api/customers/[id], DELETE /api/customers/[id].
                // I missed GET /api/customers/[id]!
                // I need to add that.

                if (res.ok) {
                    // Actually I need to check if I created GET. 
                    // I wrote: export async function PUT... export async function DELETE...
                    // I missed GET.
                }

                // I'll fix the API first or handle it here? No, I must fix API.

                const data = await res.json();
                if (data.success) {
                    setCustomer(data.customer); // The API PUT returns customer, usually API GET should too.
                } else {
                    toast({ title: 'Error', description: data.message, variant: 'destructive' });
                    router.push('/customers');
                }
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to fetch customer', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        // I will assume the API exists for now and I will fix it in next step.
        // Or I can add the code to fetch now.

        // Actually, I can use the list and filter but that's bad.
        // I should create GET /api/customers/[id].

        // For now I'll just put the fetch call.
        fetchCustomer();
    }, [params.id, router, toast]);

    if (loading) return <div className="container mx-auto py-10 text-center">Loading...</div>;
    if (!customer) return <div className="container mx-auto py-10 text-center">Customer not found</div>;

    return (
        <div className="container mx-auto py-10 px-4">
            <CustomerForm initialData={customer} />
        </div>
    );
}
