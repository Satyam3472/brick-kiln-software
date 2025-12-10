import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/middleware/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Get current user from token
        const sessionUser = await getCurrentUser(request);

        if (!sessionUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authenticated',
                },
                { status: 401 }
            );
        }

        // Fetch full user details from database
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred',
            },
            { status: 500 }
        );
    }
}
