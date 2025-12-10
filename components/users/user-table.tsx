'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { UserResponse } from '@/types/user';

interface UserTableProps {
    users: UserResponse[];
}

export function UserTable({ users }: UserTableProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleEdit = (userId: string) => {
        router.push(`/admin/users/${userId}/edit`);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        setDeletingId(userId);

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                router.refresh();
            } else {
                alert(data.message || 'Failed to delete user');
            }
        } catch (err) {
            alert('An error occurred while deleting user');
        } finally {
            setDeletingId(null);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'destructive';
            case 'MANAGER':
                return 'default';
            case 'STAFF':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        return status === 'ACTIVE' ? 'default' : 'outline';
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(user.status)}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(user.id)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deletingId === user.id}
                                        >
                                            {deletingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
