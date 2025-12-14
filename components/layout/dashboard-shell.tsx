"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
    children: React.ReactNode;
    userRole: string;
    userName?: string;
}

export function DashboardShell({ children, userRole, userName }: DashboardShellProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <Sidebar userRole={userRole} className="hidden md:flex" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userRole={userRole} userName={userName} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200 ease-in-out">
                    {children}
                </main>
            </div>
        </div>
    );
}
