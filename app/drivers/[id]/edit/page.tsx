'use client';

import { useEffect, useState } from 'react';
import { DriverForm } from '@/components/drivers/DriverForm';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EditDriverPage({ params }: { params: { id: string } }) {
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    // I need to add GET /api/drivers/[id] as well.
    useEffect(() => {
        const fetchDriver = async () => {
            try {
                // Placeholder: Assume API GET endpoints exist now or will exist
                // I'll add GET /api/drivers/[id] next
                const res = await fetch(`/api/drivers/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setDriver(data.driver);
                } else {
                    toast({ title: 'Error', description: data.message, variant: 'destructive' });
                    router.push('/drivers');
                }
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to fetch driver', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchDriver();
    }, [params.id, router, toast]);

    if (loading) return <div className="container mx-auto py-10 text-center">Loading...</div>;
    if (!driver) return <div className="container mx-auto py-10 text-center">Driver not found</div>;


    return (
        <div className="container mx-auto py-10 px-4">
            <DriverForm initialData={driver} />
        </div>
    );
}
