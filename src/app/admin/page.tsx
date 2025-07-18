'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';


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

export default function AdminPage() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('AdminPage must be used within an AppProvider');
  }
  
  const { drivers, updateDriverStatus, user, translations, loading } = context;
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
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.registrationApplications}</CardTitle>
          <CardDescription>{pendingDrivers.length > 0 ? `You have ${pendingDrivers.length} pending applications.` : t.noPendingApplications}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
                        <Image src={driver.carPhotoUrl} alt={driver.carModel} width={64} height={40} className="rounded-md object-cover" data-ai-hint="car side" />
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
        </CardContent>
      </Card>
    </div>
  );
}
