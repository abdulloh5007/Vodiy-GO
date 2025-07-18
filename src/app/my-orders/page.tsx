'use client';

import { useContext, useMemo } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, User, Phone, MapPin, Clock } from 'lucide-react';

function MyOrdersSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function MyOrdersPage() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('MyOrdersPage must be used within an AppProvider');
    }

    const { user, rides, orders, drivers, loading, translations } = context;
    const t = translations;

    const driverProfile = user ? drivers.find(d => d.id === user.uid) : undefined;

    const myRides = useMemo(() => {
        if (!user) return [];
        return rides.filter(ride => ride.driverId === user.uid);
    }, [rides, user]);

    const myRideOrders = useMemo(() => {
        if (!myRides.length) return [];
        const myRideIds = myRides.map(r => r.id);
        return orders.filter(order => myRideIds.includes(order.rideId));
    }, [orders, myRides]);

    if (loading || !t.home) {
        return <MyOrdersSkeleton />;
    }

    if (!user || !driverProfile) {
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

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{t.myOrders || 'My Bookings'}</CardTitle>
                    <CardDescription>{t.ordersForYourRides || 'Bookings for your active rides.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.ride || 'Ride'}</TableHead>
                                <TableHead>{t.clientName || 'Client Name'}</TableHead>
                                <TableHead>{t.clientPhone || 'Client Phone'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myRideOrders.length > 0 ? (
                                myRideOrders.map(order => {
                                    const ride = myRides.find(r => r.id === order.rideId);
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                {ride ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4" /> {ride.from} &rarr; {ride.to}</span>
                                                        {ride.time && <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" />{ride.time}</span>}
                                                    </div>
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {order.clientName}
                                            </TableCell>
                                            <TableCell>
                                                <a href={`tel:${order.clientPhone}`} className="flex items-center gap-2 hover:text-primary">
                                                    <Phone className="h-4 w-4" />
                                                    {order.clientPhone}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">{t.noBookingsYet || 'No bookings for your rides yet.'}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
