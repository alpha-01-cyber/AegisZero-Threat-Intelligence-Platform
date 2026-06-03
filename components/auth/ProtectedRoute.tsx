// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// ProtectedRoute.tsx

"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [minLoading, setMinLoading] = useState(true);

    useEffect(() => {
        // Check if we've already shown the loading screen in this session
        const hasLoaded = sessionStorage.getItem('app_loaded');

        if (hasLoaded) {
            setMinLoading(false);
        } else {
            const timer = setTimeout(() => {
                setMinLoading(false);
                sessionStorage.setItem('app_loaded', 'true');
            }, 40000); // Minimum 40 seconds loading time on first visit
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (!loading && !minLoading && !user) {
            router.push('/login');
        }
    }, [user, loading, minLoading, router]);

    if (loading || minLoading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
