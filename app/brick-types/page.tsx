'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface BrickType {
    id: string;
    name: string;
    description: string | null;
    rateDefault: number | null;
}

export default function BrickTypesPage() {
    const [brickTypes, setBrickTypes] = useState<BrickType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchBrickTypes();
    }, []);

    const fetchBrickTypes = async () => {
        try {
            const res = await fetch('/api/brick-types');
            const data = await res.json();
            if (data.success) {
                setBrickTypes(data.brickTypes);
            } else {
                toast({ title: 'Error', description: data.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch brick types', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Brick Types</h1>
                <Link href="/brick-types/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Brick Type
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Default Rate</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : brickTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No brick types found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            brickTypes.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-medium">{type.name}</TableCell>
                                    <TableCell>{type.description || '-'}</TableCell>
                                    <TableCell className="text-right">{type.rateDefault || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/brick-types/${type.id}/edit`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
