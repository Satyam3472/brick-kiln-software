import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.error.errors[0].message,
                },
                { status: 400 }
            );
        }

        const { identifier, password } = validation.data;

        // Find user by email or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }],
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid credentials',
                },
                { status: 401 }
            );
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Your account is inactive. Please contact administrator.',
                },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid credentials',
                },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Create response with user data (without password)
        const { password: _, ...userWithoutPassword } = user;

        const response = NextResponse.json(
            {
                success: true,
                user: userWithoutPassword,
                message: 'Login successful',
            },
            { status: 200 }
        );

        // Set HTTP-only cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login',
            },
            { status: 500 }
        );
    }
}
