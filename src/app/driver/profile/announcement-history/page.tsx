
'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, History, Clock, MapPin, XCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Ride } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function RideHistoryCard({ ride, t }: { ride: Ride, t: any }) {

    const isExpired = useMemo(() => {
        if (ride.status === 'approved' && ride.approvedAt) {
            const now = Date.now();
            const rideApprovedDate = ride.approvedAt.toDate().getTime();
            const durationHours = ride.promoCode ? 24 : 12;
            const durationMillis = durationHours * 60 * 60 * 1000;
            return (now - rideApprovedDate) > durationMillis;
        }
        return false;
    }, [ride]);

    const getStatus = () => {
        if (isExpired) {
            return {
                label: t.history_status_expired || 'Expired',
                icon: <AlertCircle className="h-4 w-4 mr-1.5 text-yellow-500" />,
                variant: 'outline'
            }
        }
        switch (ride.status) {
            case 'rejected':
                return {
                    label: t.history_status_rejected || 'Rejected',
                    icon: <XCircle className="h-4 w-4 mr-1.5 text-red-500" />,
                    variant: 'destructive'
                };
            case 'approved':
                 return {
                    label: t.history_status_completed || 'Completed',
                    icon: <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />,
                    variant: 'secondary'
                };
            default:
                return {
                    label: ride.status,
                    icon: null,
                    variant: 'default'
                };
        }
    }

    const status = getStatus();

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <MapPin className="h-5 w-5 text-primary" /> {ride.from} &rarr; {ride.to}
                        </CardTitle>
                        {ride.createdAt && (
                            <CardDescription className="flex items-center gap-1.5 text-xs mt-1">
                                <Clock className="h-3 w-3" />
                                {ride.createdAt.toDate().toLocaleDateString()}
                            </CardDescription>
                        )}
                    </div>
                     <Badge variant={status.variant as any} className="whitespace-nowrap flex items-center">
                        {status.icon}
                        {status.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                 <p className="font-semibold">{new Intl.NumberFormat('fr-FR').format(ride.price)} UZS / {t.pricePerSeat}</p>
                 {ride.rejectionReason && (
                    <div className="text-xs text-red-500 p-2 bg-red-500/10 rounded-md">
                        <span className="font-semibold">{t.reason || 'Reason'}:</span> {ride.rejectionReason}
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}


export default function AnnouncementHistoryPage() {
    const context = useContext(AppContext);
    const router = useRouter();
    const [history, setHistory] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    if (!context) {
        throw new Error('This page must be used within an AppProvider');
    }

    const { translations: t, user } = context;

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            };

            try {
                const ridesRef = collection(db, 'rides');
                const q = query(
                    ridesRef, 
                    where("driverId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const ridesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
                
                // Filter out pending and currently active rides
                const historicalRides = ridesData.filter(ride => {
                    if (ride.status === 'pending') return false;
                    if (ride.status === 'approved' && ride.approvedAt) {
                         const now = Date.now();
                         const rideApprovedDate = ride.approvedAt.toDate().getTime();
                         const durationHours = ride.promoCode ? 24 : 12;
                         const durationMillis = durationHours * 60 * 60 * 1000;
                         return (now - rideApprovedDate) > durationMillis;
                    }
                    return ride.status === 'rejected';
                })

                setHistory(historicalRides);
            } catch (error) {
                console.error("Error fetching ride history: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

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
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                        <History />
                        {t.announcement_history_title || "Announcement History"}
                    </CardTitle>
                    <CardDescription>{t.announcement_history_desc_long || "Here you can find all your past ride announcements."}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-4">
                            {history.map(ride => <RideHistoryCard key={ride.id} ride={ride} t={t} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>{t.no_announcement_history || "You have no past announcements."}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
