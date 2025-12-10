import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password';
import { getCurrentUser } from '@/lib/middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for update
const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

/**
 * PUT /api/users/[id] - Update a user (Admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params;
        const body = await request.json();

        // Validate input
        const validation = updateUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.error.errors[0].message,
                },
                { status: 400 }
            );
        }

        const updateData = validation.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // If email is being updated, check if it's already taken
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: updateData.email },
            });

            if (emailExists) {
                return NextResponse.json(
                    { success: false, message: 'Email already exists' },
                    { status: 400 }
                );
            }
        }

        // If phone is being updated, check if it's already taken
        if (updateData.phone && updateData.phone !== existingUser.phone) {
            const phoneExists = await prisma.user.findUnique({
                where: { phone: updateData.phone },
            });

            if (phoneExists) {
                return NextResponse.json(
                    { success: false, message: 'Phone number already exists' },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const dataToUpdate: any = { ...updateData };

        // Hash password if it's being updated
        if (updateData.password) {
            dataToUpdate.password = await hashPassword(updateData.password);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
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
                user: updatedUser,
                message: 'User updated successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users/[id] - Delete a user (Admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params;

        // Prevent deleting self
        if (id === currentUser.userId) {
            return NextResponse.json(
                { success: false, message: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'User deleted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/users/[id] - Get a single user (Admin only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
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
                { success: false, message: 'User not found' },
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
        console.error('Get user error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}
