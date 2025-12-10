import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateCustomerSchema = z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    phone: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
        });

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, customer });
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validation = updateCustomerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const customer = await prisma.customer.update({
            where: { id: params.id },
            data: validation.data,
        });

        return NextResponse.json({ success: true, customer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        await prisma.customer.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        // Handle foreign key constraint errors gracefully
        return NextResponse.json({ success: false, message: 'Could not delete customer (may have related sales)' }, { status: 500 });
    }
}
