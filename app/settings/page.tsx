// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { updateUserProfile, changeUserPassword } from '@/lib/firebase';
import { countries, getCountryFlag } from '@/lib/countries';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { User, Mail, Save, CheckCircle, Lock, Eye, EyeOff, Upload, Flag, Image as ImageIcon, Check, ChevronsUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const { user, userProfile, refreshUserProfile, updateProfileLocally } = useAuth();

    // Profile states
    const [username, setUsername] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [openCountrySelect, setOpenCountrySelect] = useState(false);

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UI states
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Initialize form with user data
    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setSelectedCountry(userProfile.countryCode || '');
        } else if (user) {
            // Fallback if profile is missing but user exists
            setUsername(user.displayName || '');
        }
    }, [userProfile, user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setSuccess('');
        setError('');

        try {
            // Get country name from code
            const countryObj = countries.find(c => c.code === selectedCountry);
            const countryName = countryObj ? countryObj.name : null;

            // Prepare updates object, ensuring no undefined values
            // Explicitly set to null if empty string to clear the field in Firestore
            const updates: Partial<UserProfile> = {
                username: username || 'Analyst',
                country: countryName || null,
                countryCode: selectedCountry || null,
                updatedAt: new Date(),
            };

            console.log('💾 Saving profile updates:', updates);

            // Optimistically update local state immediately
            updateProfileLocally(updates);

            // Update profile in Firestore
            await updateUserProfile(user.uid, updates);
            console.log('✅ Profile saved to Firestore');

            // Refresh profile data from server to ensure consistency
            // Add a small delay to allow Firestore propagation
            await new Promise(resolve => setTimeout(resolve, 500));
            const refreshedProfile = await refreshUserProfile();
            console.log('🔄 Profile refreshed from Firestore:', refreshedProfile);

            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('❌ Profile update error:', err);
            setError(err.message || 'Failed to update profile');
            // Keep error visible longer
            setTimeout(() => setError(''), 8000);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setSuccess('');
        setError('');

        // Validation
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            setPasswordLoading(false);
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setPasswordLoading(false);
            setTimeout(() => setError(''), 5000);
            return;
        }

        try {
            await changeUserPassword(currentPassword, newPassword);
            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
            setTimeout(() => setError(''), 5000);
        } finally {
            setPasswordLoading(false);
        }
    };

    const currentCountryFlag = selectedCountry ? getCountryFlag(selectedCountry) : '🌍';
    const displayEmail = userProfile?.email || user?.email || '';

    return (
        <DashboardLayout title="Settings">
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Success/Error Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-600 dark:text-green-400"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">{success}</span>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400"
                        >
                            <span className="font-medium">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your profile information and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <UserAvatar
                                    username={username}
                                    photoURL={userProfile?.photoURL || undefined}
                                    logoURL={userProfile?.logoURL || undefined}
                                    countryCode={selectedCountry}
                                    className="w-20 h-20 border-2 border-border shadow-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{userProfile?.username || username || 'User'}</h3>
                                <p className="text-sm text-muted-foreground">{displayEmail}</p>
                                {userProfile?.country && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <Flag className="w-3 h-3" />
                                        {userProfile.country}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={displayEmail}
                                        className="pl-10 bg-muted/50 text-muted-foreground cursor-not-allowed opacity-75"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>

                            {/* Country Selection (Searchable) */}
                            <div className="space-y-2 flex flex-col">
                                <Label htmlFor="country">Country</Label>
                                <Popover open={openCountrySelect} onOpenChange={setOpenCountrySelect}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCountrySelect}
                                            className="w-full justify-between"
                                        >
                                            {selectedCountry
                                                ? <span className="flex items-center gap-2">
                                                    <span className="text-xl">{getCountryFlag(selectedCountry)}</span>
                                                    {countries.find((country) => country.code === selectedCountry)?.name}
                                                </span>
                                                : "Select your country..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search country..." />
                                            <CommandList>
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries.map((country) => (
                                                        <CommandItem
                                                            key={country.code}
                                                            value={country.name}
                                                            onSelect={() => {
                                                                setSelectedCountry(country.code === selectedCountry ? "" : country.code)
                                                                setOpenCountrySelect(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCountry === country.code ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <span className="flex items-center gap-2">
                                                                <span className="text-xl">{country.flag}</span>
                                                                {country.name}
                                                            </span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="text-xs text-muted-foreground">
                                    Your country flag will be used as default logo
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="current-password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 6 characters
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={passwordLoading}
                                variant="default"
                                className="gap-2"
                            >
                                {passwordLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Change Password
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Your account details and statistics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">User ID</p>
                                <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                                    {user?.uid.substring(0, 20)}...
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Account Created</p>
                                <p className="text-sm font-medium">
                                    {userProfile?.createdAt
                                        ? new Date(userProfile.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout >
    );
}
