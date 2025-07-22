
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, BellRing, PackageCheck, Ban } from 'lucide-react';

export default function NotificationsPage() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('NotificationsPage must be used within an AppProvider');
    }

    const { user, translations: t, loading } = context;

    if (loading || !t.home) {
        return (
             <div className="container mx-auto py-8 px-4">
                <p>{t.loading || "Loading..."}</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert className="text-destructive h-8 w-8" />{t.accessDenied}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{t.loginPrompt}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Placeholder content
    const notifications = [
        // Example for driver
        ...(user.role === 'driver' ? [
            { id: 1, icon: <PackageCheck className="h-6 w-6 text-green-500" />, title: t.notification_ride_approved_title || 'Ride Approved', description: t.notification_ride_approved_desc || 'Your ride from Navoiy to Buxoro has been approved and is now visible to passengers.' },
            { id: 2, icon: <BellRing className="h-6 w-6 text-primary" />, title: t.notification_new_booking_title || 'New Booking', description: t.notification_new_booking_desc || 'You have a new booking request for your ride from Navoiy to Buxoro.' },
            { id: 3, icon: <PackageCheck className="h-6 w-6 text-green-500" />, title: t.notification_app_approved_title || 'Registration Approved', description: t.notification_app_approved_desc || 'Congratulations! Your driver application has been approved.' },
        ] : []),
        // Example for passenger
         ...(user.role === 'passenger' ? [
            { id: 1, icon: <PackageCheck className="h-6 w-6 text-green-500" />, title: t.notification_booking_accepted_title || 'Booking Accepted', description: t.notification_booking_accepted_desc || 'Your booking for the ride from Sirdaryo to Toshkent has been accepted by the driver.' },
            { id: 2, icon: <Ban className="h-6 w-6 text-red-500" />, title: t.notification_booking_rejected_title || 'Booking Rejected', description: t.notification_booking_rejected_desc || 'Unfortunately, your booking for the ride from Sirdaryo to Toshkent was rejected by the driver.' },
        ] : []),
    ];


    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{t.notifications || 'Notifications'}</CardTitle>
                    <CardDescription>{t.notifications_desc || 'Here you can find your recent notifications.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    {notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map(notif => (
                                <div key={notif.id} className="flex items-start gap-4 p-4 rounded-lg border">
                                    <div className="pt-1">
                                        {notif.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{notif.title}</h3>
                                        <p className="text-sm text-muted-foreground">{notif.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">{t.no_notifications || 'You have no notifications.'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

