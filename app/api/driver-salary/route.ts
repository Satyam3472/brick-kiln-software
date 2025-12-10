import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const ledgerEntrySchema = z.object({
    driverId: z.string(),
    date: z.string().transform((str) => new Date(str)),
    type: z.enum(['salary_entry', 'advance', 'payment', 'bonus', 'penalty']),
    amount: z.number().positive(),
    note: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            return NextResponse.json({ success: false, message: 'Admin or Manager access required' }, { status: 403 });
        }

        const body = await request.json();
        const validation = ledgerEntrySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const entry = await prisma.driverSalaryLedger.create({
            data: validation.data,
        });

        return NextResponse.json({ success: true, entry }, { status: 201 });
    } catch (error) {
        console.error("Error creating ledger entry:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
