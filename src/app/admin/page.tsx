
'use client';

import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldAlert, Loader2, LayoutGrid, List, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Driver } from '@/lib/types';
import { useRouter } from 'next/navigation';


function AdminPageSkeleton() {
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

const ApplicationCard = ({ driver, onImageClick, t, onDetailsClick }: { driver: Driver, onImageClick: (url:string) => void, t: any, onDetailsClick: (id: string) => void }) => {
    return (
        <Card>
            <CardHeader className="p-4">
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
                    <div className='space-y-1 flex-grow'>
                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                        <CardDescription>{driver.phone}</CardDescription>
                         <p className="text-sm font-medium pt-1">{driver.carModel} <span className="text-muted-foreground font-mono">({driver.carNumber})</span></p>
                    </div>
                     <Badge variant="secondary">{driver.status}</Badge>
                </div>
            </CardHeader>
            <CardFooter className="p-2">
                 <Button variant="outline" className="w-full" onClick={() => onDetailsClick(driver.id)}>
                    {t.viewApplication || 'View Application'}
                 </Button>
            </CardFooter>
        </Card>
    );
};


export default function AdminPage() {
  const context = useContext(AppContext);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const router = useRouter();
  
  useEffect(() => {
    const savedViewMode = localStorage.getItem('admin-applications-view-mode') as 'table' | 'card';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleSetViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('admin-applications-view-mode', mode);
  }

  if (!context) {
    throw new Error('AdminPage must be used within an AppProvider');
  }
  
  const { drivers, user, translations, loading, setSelectedImage } = context;
  const t = translations;

  if (loading || !t.home) {
    return <AdminPageSkeleton />;
  }
  
  const pendingDrivers = drivers.filter(d => d.status === 'pending');

  const handleDetailsClick = (driverId: string) => {
    router.push(`/admin/applications/${driverId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">{t.registrationApplications}</CardTitle>
                <CardDescription>{pendingDrivers.length > 0 ? (t.rideApplications_desc || `You have {count} pending applications.`).replace('{count}', String(pendingDrivers.length)) : t.noPendingApplications}</CardDescription>
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
        <CardContent>
           <div className={cn(viewMode !== 'table' && 'hidden')}>
             <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.applicant}</TableHead>
                    <TableHead>{t.car}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDrivers.length > 0 ? (
                    pendingDrivers.map(driver => (
                      <TableRow key={driver.id}>
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
                          <Badge variant="secondary">{driver.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm" onClick={() => handleDetailsClick(driver.id)}>
                                {t.details || 'Details'} <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">{t.noPendingApplications}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", viewMode !== 'card' && 'hidden')}>
                 {pendingDrivers.length > 0 ? (
                    pendingDrivers.map(driver => (
                        <ApplicationCard 
                            key={driver.id} 
                            driver={driver}
                            onDetailsClick={handleDetailsClick}
                            onImageClick={setSelectedImage}
                            t={t}
                        />
                    ))
                 ) : (
                    <div className="text-center py-16 col-span-full">
                        <p className="text-muted-foreground">{t.noPendingApplications}</p>
                    </div>
                 )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
