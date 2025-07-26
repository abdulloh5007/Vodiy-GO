
'use client';

import { useContext, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, List, LayoutGrid, Clock, MapPin, Ticket } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Ride, Driver } from '@/lib/types';


function RideApplicationsSkeleton() {
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
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                           <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-5 w-24 mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-16 rounded-md" />
                                        <div>
                                            <Skeleton className="h-5 w-28 mb-2" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>
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
    )
}

const RideApplicationCard = ({ ride, driver, onDetailsClick, onImageClick, t }: { ride: Ride, driver?: Driver, onDetailsClick: (id: string) => void, onImageClick: (url: string) => void, t: any }) => {
    if (!driver) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">{ride.from} &rarr; {ride.to}</CardTitle>
                <CardDescription className='flex items-center gap-1'><Clock className="h-4 w-4" />{ride.time || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 border-t">
                 <div className="flex items-start gap-4">
                    <Image 
                        src={driver.carPhotoUrl} 
                        alt={driver.carModel} 
                        width={100} 
                        height={64} 
                        className="rounded-md object-cover cursor-pointer aspect-video" 
                        data-ai-hint="car side"
                        onClick={() => onImageClick(driver.carPhotoUrl)}
                    />
                    <div className='space-y-1'>
                        <p className="font-semibold">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">{driver.carModel} ({driver.carNumber})</p>
                        <p className="text-sm font-bold">{new Intl.NumberFormat('fr-FR').format(ride.price)} UZS</p>
                    </div>
                </div>
                {ride.promoCode && <Badge variant="outline" className='flex items-center gap-1.5 w-fit'><Ticket className='h-4 w-4 text-green-500'/> {ride.promoCode}</Badge>}
            </CardContent>
            <CardFooter className="p-2">
                 <Button variant="outline" className="w-full" onClick={() => onDetailsClick(ride.id)}>
                    {t.details || 'Details'} <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
            </CardFooter>
        </Card>
    );
};


export default function RideApplicationsPage() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  useEffect(() => {
    const savedViewMode = localStorage.getItem('ride-applications-view-mode') as 'table' | 'card';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleSetViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('ride-applications-view-mode', mode);
  }

  if (!context) {
    throw new Error('AdminPage must be used within an AppProvider');
  }
  
  const { drivers, rides, translations, loading, setSelectedImage } = context;
  const t = translations;
  
  const pendingRides = useMemo(() => rides.filter(r => r.status === 'pending'), [rides]);

  if (loading || !t.home) {
    return <RideApplicationsSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-2xl">{t.rideApplications || 'Ride Applications'}</CardTitle>
                <CardDescription>
                    {pendingRides.length > 0 
                        ? (t.rideApplications_desc || `You have {count} pending ride applications.`).replace('{count}', String(pendingRides.length)) 
                        : (t.rideApplications_desc_none || 'No pending ride applications.')}
                </CardDescription>
            </div>
             <div className="flex items-center gap-2 self-end md:self-auto">
                <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetViewMode('table')}>
                    <List className="h-5 w-5" />
                </Button>
                 <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetViewMode('card')}>
                    <LayoutGrid className="h-5 w-5" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {pendingRides.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">{t.noPendingRideApplications || 'No pending ride applications'}</p>
                </div>
            ) : (
                <>
                    <div className={cn(viewMode !== 'table' && 'hidden')}>
                        <div className="w-full overflow-x-auto">
                            <Table className="min-w-[900px]">
                                <TableHeader>
                                <TableRow>
                                    <TableHead>{t.ride_table_driver || 'Driver'}</TableHead>
                                    <TableHead>{t.ride_table_car || 'Car'}</TableHead>
                                    <TableHead>{t.ride_table_ride || 'Ride'}</TableHead>
                                    <TableHead>{t.ride_table_price || 'Price'}</TableHead>
                                    <TableHead>{t.promoCode || 'Promo Code'}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRides.map(ride => {
                                        const driver = drivers.find(d => d.id === ride.driverId);
                                        if (!driver) return null;
                                        return (
                                            <TableRow key={ride.id}>
                                                <TableCell>
                                                    <div className="font-medium">{driver.name}</div>
                                                    <div className="text-sm text-muted-foreground">{driver.phone}</div>
                                                </TableCell>
                                                <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Image 
                                                        src={driver.carPhotoUrl} 
                                                        alt={driver.carModel} 
                                                        width={64} 
                                                        height={40} 
                                                        className="rounded-md object-cover cursor-pointer" 
                                                        data-ai-hint="car side"
                                                        onClick={() => setSelectedImage(driver.carPhotoUrl)}
                                                    />
                                                    <div>
                                                        <div>{driver.carModel}</div>
                                                        <div className="text-sm text-muted-foreground">{driver.carNumber}</div>
                                                    </div>
                                                </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4"/> {ride.from} &rarr; {ride.to}</div>
                                                    {ride.time && <div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4"/> {ride.time}</div>}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold">{new Intl.NumberFormat('fr-FR').format(ride.price)} UZS</div>
                                                </TableCell>
                                                <TableCell>
                                                    {ride.promoCode ? <Badge variant="outline">{ride.promoCode}</Badge> : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/ride-applications/${ride.id}`)}>
                                                        {t.details || 'Details'} <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", viewMode !== 'card' && 'hidden')}>
                        {pendingRides.map(ride => {
                            const driver = drivers.find(d => d.id === ride.driverId);
                            return (
                                <RideApplicationCard 
                                    key={ride.id} 
                                    ride={ride}
                                    driver={driver}
                                    onDetailsClick={(id) => router.push(`/admin/ride-applications/${id}`)}
                                    onImageClick={setSelectedImage}
                                    t={t}
                                />
                            )
                        })}
                    </div>
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
