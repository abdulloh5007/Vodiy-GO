
'use client';

import { useContext, useMemo, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, User, Phone, MapPin, Clock, Check, X, Ban, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order, Ride } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';


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

const OrderStatusBadge = ({ status, t }: { status: Order['status'], t: any}) => {
    const statusMap = {
        new: { variant: 'default', label: t.statusNew || 'New' },
        accepted: { variant: 'secondary', label: t.statusAccepted || 'Accepted' },
        rejected: { variant: 'destructive', label: t.statusRejected || 'Rejected' }
    };
    const currentStatus = statusMap[status] || { variant: 'default', label: status };

    return <Badge variant={currentStatus.variant as any}>{currentStatus.label}</Badge>
}

const OrderCard = ({ order, ride, onUpdateStatus, t }: { order: Order, ride?: Ride, onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => void, t: any }) => {
    return (
        <Card>
            <CardHeader>
                {ride ? (
                    <>
                    <CardTitle className='flex items-center gap-2 text-xl'>{ride.from} &rarr; {ride.to}</CardTitle>
                    {ride.time && <CardDescription className='flex items-center gap-1'><Clock className="h-4 w-4" />{ride.time}</CardDescription>}
                    </>
                ) : (
                    <CardTitle>N/A</CardTitle>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                 <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.clientName}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                     <a href={`tel:${order.clientPhone}`} className="hover:text-primary">
                        {order.clientPhone}
                    </a>
                </div>
                <div className="pt-2">
                    <OrderStatusBadge status={order.status} t={t} />
                </div>
            </CardContent>
            {order.status === 'new' && (
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onUpdateStatus(order.id, 'accepted')}>
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onUpdateStatus(order.id, 'rejected')}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default function MyOrdersPage() {
    const context = useContext(AppContext);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const router = useRouter();

    if (!context) {
        throw new Error('MyOrdersPage must be used within an AppProvider');
    }

    const { user, rides, orders, drivers, loading, translations, updateOrderStatus } = context;
    const t = translations;

    const driverProfile = user ? drivers.find(d => d.id === user.uid) : undefined;

    useEffect(() => {
        if (!loading && (!user || user.role !== 'driver')) {
            router.push('/driver/login');
        }
    }, [user, loading, router]);

    const myRides = useMemo(() => {
        if (!user) return [];
        return rides.filter(ride => ride.driverId === user.uid);
    }, [rides, user]);

    const myRideOrders = useMemo(() => {
        if (!myRides.length) return [];
        const myRideIds = myRides.map(r => r.id);
        return orders.filter(order => myRideIds.includes(order.rideId)).sort((a,b) => (a.status === 'new' ? -1 : 1));
    }, [orders, myRides]);
    
    if (loading || !t.home || !user || !driverProfile) {
        return <MyOrdersSkeleton />;
    }
    
    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">{t.myOrders || 'My Bookings'}</CardTitle>
                        <CardDescription>{t.ordersForYourRides || 'Bookings for your active rides.'}</CardDescription>
                    </div>
                     <div className="hidden md:flex items-center gap-2">
                        <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('table')}>
                            <List className="h-5 w-5" />
                        </Button>
                        <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')}>
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className={cn("hidden p-0", viewMode === 'table' && 'md:block')}>
                    <div className="w-full overflow-x-auto">
                        <Table className="min-w-[800px]">
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
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        {order.clientName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <a href={`tel:${order.clientPhone}`} className="flex items-center gap-2 hover:text-primary">
                                                        <Phone className="h-4 w-4" />
                                                        {order.clientPhone}
                                                    </a>
                                                </TableCell>
                                                <TableCell>
                                                    <OrderStatusBadge status={order.status} t={t} />
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
                    </div>
                </CardContent>
            </Card>

             <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", viewMode === 'card' ? 'block' : 'md:hidden')}>
                {myRideOrders.length > 0 ? (
                   myRideOrders.map(order => {
                        const ride = myRides.find(r => r.id === order.rideId);
                        return (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                ride={ride} 
                                onUpdateStatus={updateOrderStatus} 
                                t={t}
                            />
                        );
                   })
                ) : (
                     <div className="text-center py-16 col-span-full bg-card rounded-lg">
                        <p className="text-muted-foreground">{t.noBookingsYet || 'No bookings for your rides yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
