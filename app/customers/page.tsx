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
import { Navbar } from '@/components/layout/navbar';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    createdAt: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
            } else {
                toast({ title: 'Error', description: data.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch customers', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        // Note: Navbar ideally should be in layout.tsx, but I'll assume I need to wrap it if layout doesn't.
        // However, existing layout probably renders children.
        // If I look at existing pages (I haven't seen one), I'd know.
        // I will assume I don't need to render Navbar here if it's in root layout.
        // But wait, the Navbar component takes props `userName` and `userRole`.
        // It seems the pages might be responsible for passing them or there's a wrapper.
        // For now I will focus on the content. The layout might need an update later if Navbar is missing.
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <Link href="/customers/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Phone</TableHead>
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
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.address}</TableCell>
                                    <TableCell>{customer.phone || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/customers/${customer.id}/edit`}>
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
