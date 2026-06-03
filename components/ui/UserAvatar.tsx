"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCountryFlag } from '@/lib/countries';

interface UserAvatarProps {
    username?: string;
    photoURL?: string;
    logoURL?: string;
    countryCode?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function UserAvatar({ username = 'User', photoURL, logoURL, countryCode, size = 'md', className }: UserAvatarProps) {
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    // Priority: custom logo > photoURL > country flag > initials
    const displayImage = logoURL || photoURL;
    const countryFlag = countryCode ? getCountryFlag(countryCode) : null;

    return (
        <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
            {displayImage && <AvatarImage src={displayImage} alt={username} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center">
                {countryFlag ? (
                    <span className="text-lg leading-none flex items-center justify-center w-full h-full pb-0.5">{countryFlag}</span>
                ) : (
                    getInitials(username)
                )}
            </AvatarFallback>
        </Avatar>
    );
}
