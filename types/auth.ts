import { Role } from '@prisma/client';

export interface UserWithoutPassword {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginRequest {
    identifier: string; // email or phone
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: UserWithoutPassword;
    message?: string;
}

export interface SessionUser {
    userId: string;
    email: string;
    role: Role;
}
