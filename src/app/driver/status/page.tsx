
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function DriverStatusPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('DriverStatusPage must be used within an AppProvider');
    }

    const { user, drivers, loading, translations: t, logout } = context;

    const driverProfile = user ? drivers.find(d => d.id === user.uid) : null;
    const status = driverProfile?.status;

    useEffect(() => {
        if (!loading && !user) {
            router.push('/driver/login');
        }
        if (!loading && user && user.role !== 'driver') {
             router.push('/');
        }
    }, [user, loading, router]);
    
    if (loading || !t.home || !user) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    const getStatusContent = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: <ShieldAlert className="h-16 w-16 text-yellow-500" />,
                    title: t.statusPage_pending_title || "Application Pending",
                    description: t.statusPage_pending_desc || "Your application is currently under review. We will notify you once it's processed. Thank you for your patience.",
                    showLogout: true,
                };
            case 'verified':
                 // Redirect if verified
                router.push('/create-ride');
                return {
                     icon: <ShieldCheck className="h-16 w-16 text-green-500" />,
                     title: t.statusPage_verified_title || "Application Verified!",
                     description: t.statusPage_verified_desc || "Redirecting you to the dashboard...",
                     showLogout: false,
                };
            case 'rejected':
                return {
                    icon: <ShieldX className="h-16 w-16 text-destructive" />,
                    title: t.statusPage_rejected_title || "Application Rejected",
                    description: t.statusPage_rejected_desc || "We're sorry, but your application could not be approved at this time. Please contact support for more information.",
                    showLogout: true,
                };
            default:
                 // This could be the state before the driver document is created or found
                return {
                    icon: <Loader2 className="h-16 w-16 animate-spin" />,
                    title: t.statusPage_checking_title || "Checking Status...",
                    description: t.statusPage_checking_desc || "Please wait while we check your application status.",
                    showLogout: false,
                };
        }
    };
    
    const {icon, title, description, showLogout} = getStatusContent();


    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="items-center">
                    {icon}
                    <CardTitle className="mt-4">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>{description}</CardDescription>
                     {showLogout && (
                        <Button variant="outline" className="mt-6" onClick={logout}>
                            {t.logout || 'Logout'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
