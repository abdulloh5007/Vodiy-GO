'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, User, Car, Hash, Shield, Check, X } from 'lucide-react';
import Image from 'next/image';
import { RejectionDialog } from '@/components/RejectionDialog';

function ApplicationDetailSkeleton() {
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
                            <Skeleton className="h-6 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ApplicationDetailPage() {
    const context = useContext(AppContext);
    const router = useRouter();
    const params = useParams();
    const driverId = params.driverId as string;
    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

    if (!context) {
        throw new Error('ApplicationDetailPage must be used within an AppProvider');
    }

    const { drivers, loading, translations: t, updateDriverStatus, setSelectedImage } = context;

    const driver = drivers.find(d => d.id === driverId);
    
    if (loading || !t.home) {
        return <ApplicationDetailSkeleton />;
    }
    
    if (!driver) {
        return <div className="container mx-auto py-8 px-4">Application not found.</div>;
    }

    const handleApprove = async () => {
        await updateDriverStatus(driver.id, 'verified');
        router.push('/admin');
    }

    const handleReject = async (reason: string) => {
        if (!reason) return;
        await updateDriverStatus(driver.id, 'rejected', reason);
        router.push('/admin');
    }

    return (
        <>
            <div className="container mx-auto py-8 px-4">
                <div className="mb-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t.back_button || 'Back'}
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t.applicationDetails || 'Application Details'}</CardTitle>
                        <CardDescription>{t.reviewApplicationFor || 'Review application for'} {driver.name}</CardDescription>
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
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="destructive" onClick={() => setIsRejectionDialogOpen(true)}>
                            <X className="mr-2 h-4 w-4" /> {t.reject}
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                            <Check className="mr-2 h-4 w-4" /> {t.approve}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <RejectionDialog 
                isOpen={isRejectionDialogOpen}
                onClose={() => setIsRejectionDialogOpen(false)}
                onConfirm={handleReject}
                t={t}
            />
        </>
    );
}
