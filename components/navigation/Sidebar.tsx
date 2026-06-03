// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// Sidebar.tsx

"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/lib/firebase';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ShieldAlert,
    Activity,
    Settings,
    LogOut,
    Shield,
    Search,
    Globe,
    FileText,
    Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
    { icon: LayoutDashboard, label: 'Command Centre', href: '/' },
    { icon: ShieldAlert, label: 'Active Threats', href: '/active-threats' },
    { icon: Search, label: 'IOC Search', href: '/ioc-search' },
    { icon: Globe, label: 'Network Map', href: '/network-map' },
    { icon: Activity, label: 'Analytics', href: '/analytics' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: Bot, label: 'AI Analyst', href: '/ai-insights' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, userProfile } = useAuth();

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            } else {
                await logoutUser();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <aside className="w-20 h-screen bg-background/95 backdrop-blur-xl border-r border-border/50 flex flex-col items-center py-6 z-50">
            {/* Logo */}
            {/* Logo */}
            <div className="mb-8">
                <Link href="/">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden"
                    >
                        {userProfile?.logoURL ? (
                            <img
                                src={userProfile.logoURL}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Shield className="w-6 h-6 text-white" />
                        )}
                    </motion.div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full flex flex-col items-center gap-4">
                <TooltipProvider delayDuration={0}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link href={item.href}>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </motion.div>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="ml-2">
                                    <p>{item.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </nav>

            {/* Logout */}
            <div className="mt-auto">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                            <p>Logout</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </aside>
    );
}
