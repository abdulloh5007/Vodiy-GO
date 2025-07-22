'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldAlert, Loader2, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Driver } from '@/lib/types';


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

const ApplicationCard = ({ driver, onUpdateStatus, onImageClick, t }: { driver: Driver, onUpdateStatus: (id: string, status: 'verified' | 'rejected') => void, onImageClick: (url: string) => void, t: any }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{driver.name}</CardTitle>
                <CardDescription>{driver.phone}</CardDescription>
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
                    <div className='space-y-1'>
                        <p className="font-semibold">{driver.carModel}</p>
                        <p className="text-sm text-muted-foreground">{driver.carNumber}</p>
                        <Badge variant="secondary">{driver.status}</Badge>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onUpdateStatus(driver.id, 'verified')}>
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onUpdateStatus(driver.id, 'rejected')}>
                    <X className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function AdminPage() {
  const context = useContext(AppContext);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  if (!context) {
    throw new Error('AdminPage must be used within an AppProvider');
  }
  
  const { drivers, updateDriverStatus, user, translations, loading, setSelectedImage } = context;
  const t = translations;

  if (loading || !t.home) {
    return <AdminPageSkeleton />;
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

  const pendingDrivers = drivers.filter(d => d.status === 'pending');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">{t.registrationApplications}</CardTitle>
                <CardDescription>{pendingDrivers.length > 0 ? `You have ${pendingDrivers.length} pending applications.` : t.noPendingApplications}</CardDescription>
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
        <CardContent>
           <div className={cn("hidden", viewMode === 'table' && 'md:block')}>
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
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateDriverStatus(driver.id, 'verified')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateDriverStatus(driver.id, 'rejected')}>
                            <X className="h-4 w-4" />
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
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", viewMode === 'card' ? 'block' : 'md:hidden')}>
                 {pendingDrivers.length > 0 ? (
                    pendingDrivers.map(driver => (
                        <ApplicationCard 
                            key={driver.id} 
                            driver={driver}
                            onUpdateStatus={updateDriverStatus}
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
