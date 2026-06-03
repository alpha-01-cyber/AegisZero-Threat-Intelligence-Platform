// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// AuthContext.tsx

"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, getUserData, UserProfile } from "@/lib/firebase";

export type { UserProfile };

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    refreshUserProfile: () => Promise<UserProfile | null>;
    updateProfileLocally: (updates: Partial<UserProfile>) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Load profile from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("userProfile");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as UserProfile;
                    setUserProfile(parsed);
                } catch (e) {
                    console.warn("Failed to parse stored user profile", e);
                    localStorage.removeItem("userProfile");
                }
            }
        }
    }, []);

    // Sync profile changes to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (userProfile) {
                localStorage.setItem("userProfile", JSON.stringify(userProfile));
            } else {
                localStorage.removeItem("userProfile");
            }
        }
    }, [userProfile]);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                try {
                    const profile = await getUserData(currentUser.uid);
                    console.log("📥 User profile loaded:", profile);
                    setUserProfile(profile);
                } catch (error) {
                    console.error("❌ Error fetching user profile:", error);
                    setUserProfile(null);
                }
            } else {
                console.log("👤 User logged out");
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const refreshUserProfile = async (): Promise<UserProfile | null> => {
        if (!user) return null;
        try {
            console.log("🔄 Refreshing user profile for", user.uid);
            const profile = await getUserData(user.uid);
            console.log("✅ Profile fetched:", profile);
            setUserProfile(profile);
            return profile;
        } catch (error) {
            console.error("❌ Error refreshing user profile:", error);
            throw error;
        }
    };

    const updateProfileLocally = (updates: Partial<UserProfile>) => {
        if (userProfile) {
            const newProfile = { ...userProfile, ...updates };
            setUserProfile(newProfile);
        } else if (user) {
            const tempProfile: UserProfile = {
                uid: user.uid,
                email: user.email || "",
                username: updates.username || "Analyst",
                country: updates.country || null,
                countryCode: updates.countryCode || null,
                createdAt: new Date(),
                updatedAt: new Date(),
                // optional fields omitted
            } as UserProfile;
            setUserProfile(tempProfile);
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                loading,
                refreshUserProfile,
                updateProfileLocally,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
