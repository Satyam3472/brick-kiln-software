import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const createSaleSchema = z.object({
    date: z.string().transform((str) => new Date(str)),
    customerId: z.string(),
    driverId: z.string(),
    brickTypeId: z.string(),
    chalanNo: z.string().min(1),
    quantity: z.number().int().positive(),
    rate: z.number().positive(),
    paid: z.number().min(0),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        // Staff cannot view sales list
        if (user.role === 'STAFF') {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const customerId = searchParams.get('customerId');
        const driverId = searchParams.get('driverId');
        const brickTypeId = searchParams.get('brickTypeId');
        const unpaidOnly = searchParams.get('unpaid') === 'true';

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (startDate) {
            where.date = { gte: new Date(startDate) };
        }

        if (customerId) where.customerId = customerId;
        if (driverId) where.driverId = driverId;
        if (brickTypeId) where.brickTypeId = brickTypeId;

        if (unpaidOnly) {
            where.balance = { gt: 0 };
        }

        const [sales, total] = await prisma.$transaction([
            prisma.sale.findMany({
                where,
                include: {
                    customer: { select: { name: true } },
                    driver: { select: { name: true } },
                    brickType: { select: { name: true } },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.sale.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            sales,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching sales:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        // All roles can create sales

        const body = await request.json();
        const validation = createSaleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, message: validation.error.errors[0].message }, { status: 400 });
        }

        const { date, customerId, driverId, brickTypeId, chalanNo, quantity, rate, paid } = validation.data;

        const amount = quantity * rate;
        const balance = amount - paid;

        const sale = await prisma.sale.create({
            data: {
                date,
                customerId,
                driverId,
                brickTypeId,
                chalanNo,
                quantity,
                rate,
                amount,
                paid,
                balance,
            },
        });

        return NextResponse.json({ success: true, sale }, { status: 201 });
    } catch (error) {
        console.error("Error creating sale:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
