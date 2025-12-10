'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { UserResponse } from '@/types/user';

interface UserFormProps {
    user?: UserResponse | null;
    mode: 'create' | 'edit';
}

export function UserForm({ user, mode }: UserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        role: user?.role || 'STAFF',
        status: user?.status || 'ACTIVE',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const url = mode === 'create' ? '/api/users' : `/api/users/${user?.id}`;
            const method = mode === 'create' ? 'POST' : 'PUT';

            const body: any = { ...formData };

            // Don't send password if it's empty in edit mode
            if (mode === 'edit' && !body.password) {
                delete body.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'User saved successfully');
                setTimeout(() => {
                    router.push('/admin/users');
                    router.refresh();
                }, 1000);
            } else {
                setError(data.message || 'An error occurred');
            }
        } catch (err) {
            setError('An error occurred while saving user');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        disabled={loading}
                        placeholder="+919999999999"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">
                        Password {mode === 'edit' && '(leave blank to keep current)'}
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        required={mode === 'create'}
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => handleChange('role', value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : mode === 'create' ? (
                        'Create User'
                    ) : (
                        'Update User'
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/users')}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
