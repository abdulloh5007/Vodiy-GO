'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, User, Car, Hash, Shield, BadgeCheck, BadgeAlert, BadgeX } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Driver } from '@/lib/types';


function DriverDetailSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                 <Skeleton className="h-10 w-24" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div>
                         <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const StatusBadge = ({ status, t }: { status: Driver['status'], t: any }) => {
    const statusMap = {
        verified: {
            label: t.verified || "Verified",
            icon: <BadgeCheck className="h-5 w-5 mr-2 text-green-500"/>,
            variant: "secondary"
        },
        pending: {
            label: t.pending || "Pending",
            icon: <BadgeAlert className="h-5 w-5 mr-2 text-yellow-500"/>,
            variant: "default"
        },
        rejected: {
            label: t.rejected || "Rejected",
            icon: <BadgeX className="h-5 w-5 mr-2 text-red-500"/>,
            variant: "destructive"
        }
    }
    const current = statusMap[status];

    return (
        <Badge variant={current.variant as any} className="text-base py-2 px-4">
            {current.icon} {current.label}
        </Badge>
    )
}

export default function DriverDetailPage() {
    const context = useContext(AppContext);
    const router = useRouter();
    const params = useParams();
    const driverId = params.id as string;

    if (!context) {
        throw new Error('DriverDetailPage must be used within an AppProvider');
    }

    const { drivers, loading, translations: t, setSelectedImage } = context;

    const driver = drivers.find(d => d.id === driverId);
    
    if (loading || !t.home) {
        return <DriverDetailSkeleton />;
    }
    
    if (!driver) {
        return <div className="container mx-auto py-8 px-4">Driver not found.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.back_button || 'Back'}
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{t.driverDetails || 'Driver Details'}</CardTitle>
                    <CardDescription>{t.fullInformationFor || 'Full information for'} {driver.name}</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
                    <div>
                        <Image 
                            src={driver.carPhotoUrl} 
                            alt={driver.carModel}
                            width={500}
                            height={300}
                            className="rounded-lg object-cover w-full cursor-pointer"
                            onClick={() => setSelectedImage(driver.carPhotoUrl)}
                            data-ai-hint="car side"
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <User className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.applicant}</p>
                                <p className="font-semibold text-lg">{driver.name}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <StatusBadge status={driver.status} t={t} />
                        </div>
                        <div className="flex items-center gap-3">
                            <Car className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.carModel}</p>
                                <p className="font-semibold">{driver.carModel}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <Hash className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.carNumber}</p>
                                <p className="font-semibold font-mono">{driver.carNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-muted-foreground"/>
                             <div>
                                <p className="text-sm text-muted-foreground">{t.passportNumber}</p>
                                <p className="font-semibold font-mono">{driver.passport}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-muted-foreground"/>
                             <div>
                                <p className="text-sm text-muted-foreground">{t.techPassport}</p>
                                <p className="font-semibold font-mono">{driver.techPassport}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
