// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// DashboardLayout.tsx

"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Sidebar } from "@/components/navigation/Sidebar"
import { Header } from "@/components/navigation/Header"

interface DashboardLayoutProps {
    children: React.ReactNode
    title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title={title} />
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
