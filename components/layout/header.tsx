"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar"; // Import Sidebar for mobile view

interface HeaderProps {
    userRole: string;
    userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            router.push('/login');
            router.refresh();
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all">
            <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground hover:text-foreground">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 w-72">
                            <Sidebar userRole={userRole} className="w-full border-none" />
                        </SheetContent>
                    </Sheet>

                    {/* Brand / Title Section */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                            <span className="text-lg">🧱</span>
                        </div>
                        <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Brick Kiln Management
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {/* Placeholder for future implementations like Search or Notifications */}

                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="hidden md:flex flex-col items-end mr-1">
                            <span className="text-sm font-semibold text-gray-800 leading-none">{userName}</span>
                            <span className="text-xs font-medium text-gray-500 capitalize mt-1">{userRole.toLowerCase()}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-50 to-blue-50 border border-indigo-100 hover:from-indigo-100 hover:to-blue-100 transition-all shadow-sm">
                                    <User className="h-4 w-4 text-indigo-600" />
                                    <span className="sr-only">User menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{userName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    User Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={handleLogout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
