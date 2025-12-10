import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

/**
 * GET /api/users - List all users (Admin only)
 */
export async function GET(request: NextRequest) {
    try {
        // Check authentication and authorization
        const currentUser = await getCurrentUser(request);

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        if (currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        // Fetch all users
        const users = await prisma.user.findMany({
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(
            {
                success: true,
                users,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users - Create a new user (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication and authorization
        const currentUser = await getCurrentUser(request);

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        if (currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate input
        const validation = createUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.error.errors[0].message,
                },
                { status: 400 }
            );
        }

        const { name, email, phone, password, role, status } = validation.data;

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email already exists',
                },
                { status: 400 }
            );
        }

        // Check if phone already exists
        const existingPhone = await prisma.user.findUnique({
            where: { phone },
        });

        if (existingPhone) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Phone number already exists',
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: role as Role,
                status: (status as UserStatus) || 'ACTIVE',
            },
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

        return NextResponse.json(
            {
                success: true,
                user,
                message: 'User created successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}
