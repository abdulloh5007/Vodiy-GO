
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, User, Car, Hash, Shield, Check, X, MapPin, Clock, Tag, Ticket, Hourglass } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

function RideDetailSkeleton() {
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

export default function RideApplicationDetailPage() {
    const context = useContext(AppContext);
    const router = useRouter();
    const params = useParams();
    const rideId = params.rideId as string;

    if (!context) {
        throw new Error('This page must be used within an AppProvider');
    }

    const { drivers, rides, loading, translations: t, updateRideStatus, setSelectedImage } = context;

    const ride = rides.find(r => r.id === rideId);
    const driver = ride ? drivers.find(d => d.id === ride.driverId) : null;
    
    if (loading || !t.home) {
        return <RideDetailSkeleton />;
    }
    
    if (!ride || !driver) {
        return <div className="container mx-auto py-8 px-4">Application not found.</div>;
    }

    const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
        await updateRideStatus(ride.id, status);
        router.push('/admin/ride-applications');
    }

    const formattedPrice = new Intl.NumberFormat('fr-FR').format(ride.price);

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
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">{ride.from} &rarr; {ride.to}</CardTitle>
                    <CardDescription>{t.reviewRideApplicationFor || 'Review ride application for'} {driver.name}</CardDescription>
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
                         {ride.info && <p className="text-sm text-muted-foreground border-t pt-4 mt-4">{ride.info}</p>}
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <User className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.driver}</p>
                                <p className="font-semibold text-lg">{driver.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Car className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.carModel}</p>
                                <p className="font-semibold">{driver.carModel} ({driver.carNumber})</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <Tag className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">{t.pricePerSeat}</p>
                                <p className="font-semibold font-mono">{formattedPrice} UZS</p>
                            </div>
                        </div>
                        {ride.time && (
                             <div className="flex items-center gap-3">
                                <Clock className="h-6 w-6 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t.departureTime}</p>
                                    <p className="font-semibold">{ride.time}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Hourglass className="h-6 w-6 text-muted-foreground"/>
                             <div>
                                <p className="text-sm text-muted-foreground">{t.publication_duration || "Publication Duration"}</p>
                                <p className="font-semibold font-mono">{ride.promoCode ? '24' : '12'} {t.hours || 'hours'}</p>
                            </div>
                        </div>
                        {ride.promoCode && (
                             <div className="flex items-center gap-3">
                                <Ticket className="h-6 w-6 text-muted-foreground"/>
                                 <div>
                                    <p className="text-sm text-muted-foreground">{t.promoCode_used || "Promo Code Used"}</p>
                                    <p className="font-semibold font-mono">{ride.promoCode}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                {ride.status === 'pending' && (
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="destructive" onClick={() => handleUpdateStatus('rejected')}>
                            <X className="mr-2 h-4 w-4" /> {t.reject}
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus('approved')}>
                            <Check className="mr-2 h-4 w-4" /> {t.approve}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

