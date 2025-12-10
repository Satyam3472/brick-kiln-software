'use client';

import { useEffect, useState } from 'react';
import { BrickTypeForm } from '@/components/brick-types/BrickTypeForm';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EditBrickTypePage({ params }: { params: { id: string } }) {
    const [brickType, setBrickType] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    // I need to make sure I don't forget another GET endpoint.
    // app/api/brick-types/[id]/route.ts
    // I created PUT and DELETE. Checks if I created GET?
    // I likely missed GET there too. I will check and fix both.

    useEffect(() => {
        const fetchBrickType = async () => {
            try {
                const res = await fetch(`/api/brick-types/${params.id}`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setBrickType(data.brickType);
                    } else {
                        toast({ title: 'Error', description: data.message, variant: 'destructive' });
                        router.push('/brick-types');
                    }
                } else {
                    // If the endpoint isn't ready or returns 404
                    toast({ title: 'Error', description: 'Failed to fetch brick type', variant: 'destructive' });
                    router.push('/brick-types');
                }

            } catch (error) {
                toast({ title: 'Error', description: 'Failed to fetch brick type', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchBrickType();
    }, [params.id, router, toast]);

    if (loading) return <div className="container mx-auto py-10 text-center">Loading...</div>;
    if (!brickType) return <div className="container mx-auto py-10 text-center">Brick Type not found</div>;

    return (
        <div className="container mx-auto py-10 px-4">
            <BrickTypeForm initialData={brickType} />
        </div>
    );
}
