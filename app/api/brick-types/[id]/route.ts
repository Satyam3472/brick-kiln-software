import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const brickTypeSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    rateDefault: z.number().positive().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const brickType = await prisma.brickType.findUnique({
            where: { id: params.id },
        });

        if (!brickType) {
            return NextResponse.json({ success: false, message: 'Brick type not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, brickType });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const validation = brickTypeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const brickType = await prisma.brickType.update({
            where: { id: params.id },
            data: validation.data,
        });

        return NextResponse.json({ success: true, brickType });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
        }

        await prisma.brickType.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Brick type deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
