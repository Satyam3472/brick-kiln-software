import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const brickTypeSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    rateDefault: z.number().positive().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const brickTypes = await prisma.brickType.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, brickTypes });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const validation = brickTypeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const brickType = await prisma.brickType.create({
            data: validation.data,
        });

        return NextResponse.json({ success: true, brickType }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
