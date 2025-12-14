"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Truck,
    Package,
    Settings,
    LogOut,
    Menu,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarProps {
    userRole: string;
    className?: string;
}

export function Sidebar({ userRole, className }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
            roles: ["ADMIN", "MANAGER", "STAFF"], // Adjust as needed
        },
        {
            label: "Sales",
            icon: ShoppingCart,
            href: "/sales",
            active: pathname.startsWith("/sales"),
            roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
            label: "Customers",
            icon: Users,
            href: "/customers",
            active: pathname.startsWith("/customers"),
            roles: ["ADMIN", "MANAGER"],
        },
        {
            label: "Drivers",
            icon: Truck,
            href: "/drivers",
            active: pathname.startsWith("/drivers"),
            roles: ["ADMIN", "MANAGER"],
        },
        {
            label: "Brick Types",
            icon: Package,
            href: "/brick-types",
            active: pathname.startsWith("/brick-types"),
            roles: ["ADMIN"],
        },
        {
            label: "User Management",
            icon: Settings,
            href: "/admin/users",
            active: pathname.startsWith("/admin/users"),
            roles: ["ADMIN"],
        },
    ];

    // Filter routes based on role
    const filteredRoutes = routes.filter((route) =>
        route.roles.includes(userRole)
    );

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (isMobile) {
        // Mobile drawer implementation can be handled by a sheet in the header or a simple overlay
        return null;
    }

    return (
        <div
            className={cn(
                "relative flex flex-col h-full border-r bg-slate-900 text-white transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
                {!isCollapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent truncate">
                        SSS Bricks
                    </h1>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="ml-auto text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
                <nav className="space-y-1 px-2">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center w-full p-3 text-sm font-medium rounded-lg transition-colors group",
                                route.active
                                    ? "bg-orange-600 text-white shadow-md"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? route.label : undefined}
                        >
                            <route.icon
                                className={cn("h-5 w-5", route.active ? "text-white" : "text-slate-400 group-hover:text-white", !isCollapsed && "mr-3")}
                            />
                            {!isCollapsed && <span>{route.label}</span>}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                {/* User profile section could go here */}
            </div>
        </div>
    );
}
