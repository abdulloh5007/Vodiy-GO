'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BadgeCheck, BadgeAlert, BadgeX } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Driver } from '@/lib/types';


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
    const statusMap = {
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
        }
    }
    const current = statusMap[status];

    return (
        <Badge variant={current.variant as any} className="flex items-center w-fit">
            {current.icon} {current.label}
        </Badge>
    )
}


export default function DriversPage() {
  const context = useContext(AppContext);
  const router = useRouter();
  
  if (!context) {
    throw new Error('DriversPage must be used within an AppProvider');
  }
  
  const { drivers, translations, loading, setSelectedImage } = context;
  const t = translations;

  if (loading || !t.home) {
    return <DriversPageSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">{t.drivers_title || 'Drivers'}</CardTitle>
            <CardDescription>{t.drivers_desc || 'List of all drivers in the system.'}</CardDescription>
        </CardHeader>
        <CardContent>
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
                {drivers.length > 0 ? (
                    drivers.map(driver => (
                    <TableRow key={driver.id}>
                        <TableCell>
                         <div className="flex items-center gap-3">
                            <Image 
                                src={driver.carPhotoUrl} 
                                alt={driver.name} 
                                width={40} 
                                height={40} 
                                className="rounded-full object-cover cursor-pointer" 
                                data-ai-hint="driver portrait"
                                onClick={() => setSelectedImage(driver.carPhotoUrl)}
                            />
                            <div>
                                <div className="font-medium">{driver.name}</div>
                                <div className="text-sm text-muted-foreground">{driver.id}</div>
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
        </CardContent>
      </Card>
    </div>
  );
}

