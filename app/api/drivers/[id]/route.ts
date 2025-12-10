import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const driverSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    vehicleNumber: z.string().optional(),
    monthlySalary: z.number().nonnegative().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const driver = await prisma.driver.findUnique({
            where: { id: params.id },
        });

        if (!driver) {
            return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, driver });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            return NextResponse.json({ success: false, message: 'Admin or Manager access required' }, { status: 403 });
        }

        const body = await request.json();
        const validation = driverSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const driver = await prisma.driver.update({
            where: { id: params.id },
            data: validation.data,
        });

        return NextResponse.json({ success: true, driver });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            return NextResponse.json({ success: false, message: 'Admin or Manager access required' }, { status: 403 });
        }

        await prisma.driver.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Driver deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Could not delete driver (may have related records)' }, { status: 500 });
    }
}
