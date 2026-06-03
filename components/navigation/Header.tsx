// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// Header.tsx

"use client"

import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Clock } from '@/components/ui/Clock';
import { Bell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';

interface HeaderProps {
    title?: string;
}

export function Header({ title }: HeaderProps) {
    const { userProfile } = useAuth();
    const { theme, setTheme } = useTheme();

    return (
        <header className="h-20 px-8 border-b border-border/50 bg-background/95 backdrop-blur-xl flex items-center justify-between z-40">
            {/* Left: Title */}
            <div className="flex flex-col">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold tracking-tight"
                >
                    {title || 'Dashboard'}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-muted-foreground"
                >
                    Overview & Monitoring
                </motion.p>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">
                <Clock />

                <div className="h-8 w-px bg-border/50" />

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <NotificationDropdown />

                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium leading-none">
                                {userProfile?.username || 'Analyst'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {userProfile?.email || 'SecOps Team'}
                            </p>
                        </div>
                        <UserAvatar
                            username={userProfile?.username || 'User'}
                            photoURL={userProfile?.photoURL || undefined}
                            logoURL={userProfile?.logoURL || undefined}
                            countryCode={userProfile?.countryCode || undefined}
                            className="w-10 h-10 border-2 border-background shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
