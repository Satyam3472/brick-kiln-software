import { Role, UserStatus } from '@prisma/client';

export interface CreateUserRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
    status?: UserStatus;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: Role;
    status?: UserStatus;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
