
'use client';

import { useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Trash2, ShieldCheck, Ticket } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Ride } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function ApprovedRidesPageContent() {
  const context = useContext(AppContext);
  const router = useRouter();

  if (!context) {
    throw new Error('This page must be used within an AppProvider');
  }
  
  const { drivers, rides, translations: t, loading, deleteRide } = context;
  
  const approvedRides = useMemo(() => rides.filter(r => r.status === 'approved'), [rides]);

  if (loading || !t.home) {
    return <ApprovedRidesSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <ShieldCheck className="text-green-500" />
                {t.approved_rides_title || 'Approved Rides'}
            </CardTitle>
            <CardDescription>
                {t.approved_rides_desc || 'List of all active rides. You can manage or delete them here.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {approvedRides.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">{t.no_approved_rides || 'No approved rides at the moment.'}</p>
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>{t.ride_table_driver || 'Driver'}</TableHead>
                                <TableHead>{t.ride_table_ride || 'Ride'}</TableHead>
                                <TableHead>{t.ride_table_price || 'Price'}</TableHead>
                                <TableHead>{t.promoCode || 'Promo Code'}</TableHead>
                                <TableHead className="text-right">{t.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvedRides.map((ride, index) => {
                                const driver = drivers.find(d => d.id === ride.driverId);
                                if (!driver) return null;
                                return (
                                    <TableRow key={ride.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{driver.name}</div>
                                            <div className="text-sm text-muted-foreground">{driver.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4"/> {ride.from} &rarr; {ride.to}</div>
                                            {ride.time && <div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4"/> {ride.time}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">{new Intl.NumberFormat('fr-FR').format(ride.price)} UZS</div>
                                        </TableCell>
                                        <TableCell>
                                            {ride.promoCode ? <Badge variant="outline" className="flex items-center gap-1 w-fit"><Ticket className="h-4 w-4 text-green-500"/>{ride.promoCode}</Badge> : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>{t.delete_ride_confirm_title || "Are you sure?"}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t.delete_ride_confirm_desc || "This action will permanently delete the ride announcement."}
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>{t.cancel_button || "Cancel"}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteRide(ride.id)} className="bg-destructive hover:bg-destructive/90">
                                                        {t.delete_button || "Delete"}
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovedRidesSkeleton() {
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
                        <TableHead><Skeleton className="h-5 w-12" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                           <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ApprovedRidesPage() {
    return (
        <ApprovedRidesPageContent />
    )
}
