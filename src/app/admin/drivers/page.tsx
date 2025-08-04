
'use client';

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BadgeCheck, BadgeAlert, BadgeX, List, LayoutGrid, Ban } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Driver } from '@/lib/types';
import { cn } from '@/lib/utils';


function DriversPageContent() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  useEffect(() => {
    const savedViewMode = localStorage.getItem('drivers-view-mode') as 'table' | 'card';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleSetViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('drivers-view-mode', mode);
  }
  
  if (!context) {
    throw new Error('DriversPage must be used within an AppProvider');
  }
  
  const { drivers, translations, loading, setSelectedImage } = context;
  const t = translations;

  if (loading || !t.home) {
    return <DriversPageSkeleton />;
  }
  
  const verifiedDrivers = drivers.filter(d => d.status !== 'pending');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">{t.drivers_title || 'Drivers'}</CardTitle>
              <CardDescription>{t.drivers_desc || 'List of all drivers in the system.'}</CardDescription>
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
            <div className={cn(viewMode !== 'table' && 'hidden')}>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                    <TableRow>
                        <TableHead>{t.driver}</TableHead>
                        <TableHead>{t.car}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead className="text-right">{t.details || 'Details'}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {verifiedDrivers.length > 0 ? (
                        verifiedDrivers.map(driver => (
                        <TableRow key={driver.id}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Image 
                                    src={driver.selfieUrl || 'https://placehold.co/40x40.png'} 
                                    alt={driver.name} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-full object-cover cursor-pointer" 
                                    data-ai-hint="driver portrait"
                                    onClick={() => setSelectedImage(driver.selfieUrl || 'https://placehold.co/40x40.png')}
                                />
                                <div>
                                    <div className="font-medium">{driver.name}</div>
                                    <div className="text-sm text-muted-foreground">{driver.phone}</div>
                                </div>
                            </div>
                            </TableCell>
                            <TableCell>
                                <div>{driver.carModel}</div>
                                <div className="text-sm text-muted-foreground font-mono">{driver.carNumber}</div>
                            </TableCell>
                            <TableCell>
                            <StatusBadge status={driver.status} t={t} />
                            </TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/drivers/${driver.id}`)}>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">{t.noDriversFound || 'No drivers found.'}</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
              </div>
            </div>
            <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", viewMode !== 'card' && 'hidden')}>
                 {verifiedDrivers.length > 0 ? (
                    verifiedDrivers.map(driver => (
                        <DriverCard 
                            key={driver.id} 
                            driver={driver}
                            onDetailsClick={(id) => router.push(`/admin/drivers/${id}`)}
                            t={t}
                        />
                    ))
                 ) : (
                    <div className="text-center py-16 col-span-full">
                        <p className="text-muted-foreground">{t.noDriversFound || 'No drivers found.'}</p>
                    </div>
                 )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DriversPageSkeleton() {
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
                        {[...Array(5)].map((_, i) => (
                           <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div>
                                            <Skeleton className="h-5 w-24 mb-2" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-28 mb-2" />
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-8 w-8 rounded-md" />
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

const StatusBadge = ({ status, t }: { status: Driver['status'], t: any }) => {
    const statusMap: { [key in Driver['status']]: { label: string, icon: React.ReactNode, variant: "default" | "secondary" | "destructive" | "outline" } } = {
        verified: {
            label: t.verified || "Verified",
            icon: <BadgeCheck className="h-4 w-4 mr-1"/>,
            variant: "secondary"
        },
        pending: {
            label: t.pending || "Pending",
            icon: <BadgeAlert className="h-4 w-4 mr-1"/>,
            variant: "default"
        },
        rejected: {
            label: t.rejected || "Rejected",
            icon: <BadgeX className="h-4 w-4 mr-1"/>,
            variant: "destructive"
        },
        blocked: {
            label: t.blocked || "Blocked",
            icon: <Ban className="h-4 w-4 mr-1" />,
            variant: "destructive"
        }
    }
    const current = statusMap[status];

    if (!current) {
        return <Badge variant="outline">{status}</Badge>
    }

    return (
        <Badge variant={current.variant as any} className="flex items-center w-fit">
            {current.icon} {current.label}
        </Badge>
    )
}

const DriverCard = ({ driver, onDetailsClick, t }: { driver: Driver, onDetailsClick: (id: string) => void, t: any }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">{driver.name}</CardTitle>
            <CardDescription>{driver.phone}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="text-sm font-medium">{driver.carModel} <span className="text-muted-foreground font-mono">({driver.carNumber})</span></p>
            <StatusBadge status={driver.status} t={t} />
        </CardContent>
        <CardFooter className="p-2">
            <Button variant="outline" className="w-full" onClick={() => onDetailsClick(driver.id)}>
                {t.details || 'Details'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
    </Card>
)


export default function DriversPage() {
  return (
    <DriversPageContent />
  )
}
