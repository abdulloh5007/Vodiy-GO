
'use client';

import { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldAlert, List, LayoutGrid, User, Car, Tag, Clock, MapPin } from 'lucide-react';
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

const RideApplicationCard = ({ ride, driver, onUpdateStatus, onImageClick, t }: { ride: Ride, driver?: Driver, onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void, onImageClick: (url: string) => void, t: any }) => {
    if (!driver) return null;
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(ride.price);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">{ride.from} &rarr; {ride.to}</CardTitle>
                {ride.time && <CardDescription className='flex items-center gap-1'><Clock className="h-4 w-4" />{ride.time}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-4">
                    <Image 
                        src={driver.carPhotoUrl} 
                        alt={driver.carModel} 
                        width={128} 
                        height={80} 
                        className="rounded-md object-cover cursor-pointer aspect-video" 
                        data-ai-hint="car side"
                        onClick={() => onImageClick(driver.carPhotoUrl)}
                    />
                    <div className='space-y-2'>
                        <p className="font-semibold">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">{driver.carModel} ({driver.carNumber})</p>
                        <p className="text-sm font-bold">{formattedPrice} UZS</p>
                        <Badge variant="secondary">{ride.status}</Badge>
                    </div>
                </div>
                {ride.info && <p className="text-sm text-muted-foreground border-t pt-2 mt-2">{ride.info}</p>}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onUpdateStatus(ride.id, 'approved')}>
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onUpdateStatus(ride.id, 'rejected')}>
                    <X className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function RideApplicationsPage() {
  const context = useContext(AppContext);
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
  
  const { drivers, rides, updateRideStatus, user, translations, loading, setSelectedImage } = context;
  const t = translations;
  
  const pendingRides = useMemo(() => rides.filter(r => r.status === 'pending'), [rides]);

  if (loading || !t.home) {
    return <RideApplicationsSkeleton />;
  }
  

  if (!user || user.role !== 'admin') {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert className="text-destructive h-8 w-8"/>{t.accessDenied}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t.onlyAdminsCanAccess}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">{t.rideApplications || 'Ride Applications'}</CardTitle>
                <CardDescription>
                    {pendingRides.length > 0 
                        ? (t.rideApplications_desc || `You have {count} pending ride applications.`).replace('{count}', String(pendingRides.length)) 
                        : (t.rideApplications_desc_none || 'No pending ride applications.')}
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetViewMode('table')}>
                    <List className="h-5 w-5" />
                </Button>
                 <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetViewMode('card')}>
                    <LayoutGrid className="h-5 w-5" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className={cn("p-0", viewMode !== 'table' && 'hidden')}>
           <div className="w-full overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.ride_table_driver || 'Driver'}</TableHead>
                    <TableHead>{t.ride_table_car || 'Car'}</TableHead>
                    <TableHead>{t.ride_table_ride || 'Ride'}</TableHead>
                    <TableHead>{t.ride_table_price || 'Price'}</TableHead>
                    <TableHead>{t.ride_table_status || 'Status'}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRides.length > 0 ? (
                    pendingRides.map(ride => {
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
                            <Badge variant="secondary">{t[ride.status] || ride.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateRideStatus(ride.id, 'approved')}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateRideStatus(ride.id, 'rejected')}>
                                <X className="h-4 w-4" />
                            </Button>
                            </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">{t.noPendingRideApplications || 'No pending ride applications'}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
      </Card>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", viewMode !== 'card' && 'block')}>
            {pendingRides.length > 0 ? (
            pendingRides.map(ride => {
                const driver = drivers.find(d => d.id === ride.driverId);
                return (
                    <RideApplicationCard 
                        key={ride.id} 
                        ride={ride}
                        driver={driver}
                        onUpdateStatus={updateRideStatus}
                        onImageClick={setSelectedImage}
                        t={t}
                    />
                )
            })
            ) : (
             <div className={cn("text-center py-16 col-span-full", viewMode === 'table' && 'hidden')}>
                <p className="text-muted-foreground">{t.noPendingRideApplications || 'No pending ride applications'}</p>
            </div>
            )}
      </div>
    </div>
  );
}
