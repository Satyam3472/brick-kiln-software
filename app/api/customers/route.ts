import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const createCustomerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        // All roles can create sales which implies they might need to create customers, 
        // but the prompt says Staff can create sales. 
        // Usually staff should be able to create customers too for sales.
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const validation = createCustomerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const { name, address, phone } = validation.data;

        const customer = await prisma.customer.create({
            data: { name, address, phone },
        });

        return NextResponse.json({ success: true, customer }, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
