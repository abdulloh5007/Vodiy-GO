
'use client';

import { useContext, useMemo, useEffect, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, User, Car, MapPin, Clock, HelpCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order, Ride, Driver } from '@/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format, Locale } from 'date-fns';
import { enUS, ru, uz } from 'date-fns/locale';
import { cn } from '@/lib/utils';


function MyOrdersSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="p-0">
                           <Skeleton className="h-48 w-full" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 p-4">
                             <Skeleton className="h-6 w-3/4 mb-2" />
                            <div className="flex items-center gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

const OrderStatusBadge = ({ status, t }: { status: Order['status'], t: any }) => {
    const statusMap: { [key in Order['status']]: { variant: "default" | "secondary" | "destructive", label: string, icon: React.ReactNode } } = {
        new: { variant: 'default', label: t.statusNew || 'New', icon: <HelpCircle className="h-4 w-4 mr-1" /> },
        accepted: { variant: 'secondary', label: t.statusAccepted || 'Accepted', icon: <CheckCircle2 className="h-4 w-4 mr-1" /> },
        rejected: { variant: 'destructive', label: t.statusRejected || 'Rejected', icon: <XCircle className="h-4 w-4 mr-1" /> }
    };
    const currentStatus = statusMap[status] || { variant: 'default', label: status, icon: <HelpCircle className="h-4 w-4 mr-1" /> };

    return <Badge variant={currentStatus.variant as any} className="flex items-center w-fit">{currentStatus.icon}{currentStatus.label}</Badge>
}


const OrderCard = ({ order, ride, driver, t, getLocale, setSelectedImage }: { order: Order, ride?: Ride, driver?: Driver, t: any, getLocale: () => Locale, setSelectedImage: (url: string) => void }) => {
    
    if (!ride || !driver) {
        return (
            <Card>
                <CardContent className="p-4 flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    
    const mainImageUrl = driver.carPhotoFrontUrl || 'https://placehold.co/600x400.png';

    return (
        <Card className="flex flex-col">
            <CardHeader className="p-0">
                <div 
                    className="relative aspect-video w-full rounded-t-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(mainImageUrl)}
                >
                     <Image
                        src={mainImageUrl}
                        alt="Car front view"
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        data-ai-hint="car front"
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 flex-grow">
                <CardTitle className='flex items-center gap-2 text-lg'>{ride.from} &rarr; {ride.to}</CardTitle>
                <CardDescription className='flex items-center gap-1 text-sm'>
                    <Clock className="h-4 w-4" />
                    {order.createdAt ? format(order.createdAt.seconds * 1000, 'PPP, HH:mm', { locale: getLocale() }) : t.loading }
                </CardDescription>
                <div className="space-y-1 pt-2">
                    <p className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{driver.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Car className="h-4 w-4" />{driver.carModel}</p>
                </div>
                 <div className="pt-3">
                    <OrderStatusBadge status={order.status} t={t} />
                 </div>
            </CardContent>
        </Card>
    );
};


export default function PassengerOrdersPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('PassengerOrdersPage must be used within an AppProvider');
    }

    const { user, rides, orders, drivers, loading, translations: t, language, setSelectedImage } = context;

    const myOrders = useMemo(() => {
        if (!user) return [];
        return orders
            .filter(order => order.passengerId === user.uid)
            .sort((a, b) => {
                if (!b.createdAt) return -1;
                if (!a.createdAt) return 1;
                return b.createdAt.seconds - a.createdAt.seconds
            });
    }, [orders, user]);

    const getLocale = () => {
        switch (language) {
            case 'ru': return ru;
            case 'uz': return uz;
            default: return enUS;
        }
    }

    if (loading || !user || !t.home) {
        return <MyOrdersSkeleton />;
    }
    
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">{t.myOrders || 'My Orders'}</h1>
                <p className="text-muted-foreground">{t.myOrdersDesc || 'Here you can track the status of your ride bookings.'}</p>
            </div>
            
            {myOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myOrders.map(order => {
                        const ride = rides.find(r => r.id === order.rideId);
                        const driver = ride ? drivers.find(d => d.id === ride.driverId) : undefined;
                        return (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                ride={ride} 
                                driver={driver} 
                                t={t} 
                                getLocale={getLocale} 
                                setSelectedImage={setSelectedImage}
                            />
                        )
                    })}
                 </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">{t.noOrdersYet || 'You have not booked any rides yet.'}</p>
                </div>
            )}
        </div>
    );
}
