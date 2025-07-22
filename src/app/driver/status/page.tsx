
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
                    title: "Application Pending",
                    description: "Your application is currently under review. We will notify you once it's processed. Thank you for your patience.",
                    showLogout: true,
                };
            case 'verified':
                 // Redirect if verified
                router.push('/create-ride');
                return {
                     icon: <ShieldCheck className="h-16 w-16 text-green-500" />,
                     title: "Application Verified!",
                     description: "Redirecting you to the dashboard...",
                     showLogout: false,
                };
            case 'rejected':
                return {
                    icon: <ShieldX className="h-16 w-16 text-destructive" />,
                    title: "Application Rejected",
                    description: "We're sorry, but your application could not be approved at this time. Please contact support for more information.",
                    showLogout: true,
                };
            default:
                return {
                    icon: <Loader2 className="h-16 w-16 animate-spin" />,
                    title: "Checking Status...",
                    description: "Please wait while we check your application status.",
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

