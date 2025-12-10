import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const driverSchema = z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
    vehicleNumber: z.string().optional(),
    monthlySalary: z.number().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const drivers = await prisma.driver.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, drivers });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        const driver = await prisma.driver.create({
            data: validation.data,
        });

        return NextResponse.json({ success: true, driver }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
