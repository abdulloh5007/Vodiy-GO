'use client';

import { useContext, useMemo } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, User, Phone, MapPin, Clock, Check, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';


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
                                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
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
                                     <TableCell>
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
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

const OrderStatusBadge = ({ status }: { status: Order['status']}) => {
    const variant = {
        new: 'default',
        accepted: 'secondary',
        rejected: 'destructive'
    }[status]  as "default" | "secondary" | "destructive" | null | undefined;
    
    return <Badge variant={variant}>{status}</Badge>
}

export default function MyOrdersPage() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('MyOrdersPage must be used within an AppProvider');
    }

    const { user, rides, orders, drivers, loading, translations, updateOrderStatus } = context;
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
                                <TableHead>{t.status || 'Status'}</TableHead>
                                <TableHead className="text-right">{t.actions || 'Actions'}</TableHead>
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
                                            <TableCell>
                                                <OrderStatusBadge status={order.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {order.status === 'new' ? (
                                                  <>
                                                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateOrderStatus(order.id, 'accepted')}>
                                                        <Check className="h-4 w-4" />
                                                      </Button>
                                                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateOrderStatus(order.id, 'rejected')}>
                                                        <X className="h-4 w-4" />
                                                      </Button>
                                                  </>
                                              ) : (
                                                  <Button variant="ghost" size="icon" disabled>
                                                    <Ban className="h-4 w-4 text-muted-foreground" />
                                                  </Button>
                                              )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">{t.noBookingsYet || 'No bookings for your rides yet.'}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
