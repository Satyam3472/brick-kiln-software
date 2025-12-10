import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateSaleSchema = z.object({
    date: z.string().transform((str) => new Date(str)).optional(),
    customerId: z.string().optional(),
    driverId: z.string().optional(),
    brickTypeId: z.string().optional(),
    chalanNo: z.string().min(1).optional(),
    quantity: z.number().int().positive().optional(),
    rate: z.number().positive().optional(),
    paid: z.number().min(0).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        // Staff cannot view details? Prompt says "Staff Cannot view reports". Details?
        // Probably Staff shouldn't see details if they can't list.
        if (user.role === 'STAFF') {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        const sale = await prisma.sale.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                driver: true,
                brickType: true,
            },
        });

        if (!sale) {
            return NextResponse.json({ success: false, message: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, sale });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        // Admin and Manager can edit
        if (user.role === 'STAFF') {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const validation = updateSaleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        // Need to handle recalculation if qty, rate, or paid changes.
        // Simplest is to fetch existing, merge, recalc.

        const existingSale = await prisma.sale.findUnique({ where: { id: params.id } });
        if (!existingSale) return NextResponse.json({ success: false, message: 'Sale not found' }, { status: 404 });

        const data = validation.data;

        const quantity = data.quantity ?? existingSale.quantity;
        const rate = data.rate ?? existingSale.rate;
        const paid = data.paid ?? existingSale.paid;

        const amount = quantity * rate;
        const balance = amount - paid;

        const sale = await prisma.sale.update({
            where: { id: params.id },
            data: {
                ...data,
                amount,
                balance
            },
        });

        return NextResponse.json({ success: true, sale });
    } catch (error) {
        console.error("Error updating sale:", error);
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

        await prisma.sale.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Sale deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
