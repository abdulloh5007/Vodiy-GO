
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, ChevronRight, FileText, LogOut, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Driver } from '@/lib/types';


function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <Card>
                <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2 flex-grow">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-1/4" />
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
        </div>
    );
}

const ProfileCard = ({ driver, t }: { driver: Driver, t: any }) => {
    return (
        <Card className="overflow-hidden mb-5">
            <CardContent className="p-4 flex items-center gap-4">
                <Image
                    src={driver.carPhotoUrl || 'https://placehold.co/100x100.png'}
                    alt={driver.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover aspect-square"
                    data-ai-hint="driver portrait"
                />
                <div className="flex-grow">
                    <h2 className="text-xl font-bold">{driver.name}</h2>
                    <p className="text-sm text-muted-foreground">{driver.carModel} ({driver.carNumber})</p>
                    <div className="flex items-center gap-1 mt-2 text-amber-500 cursor-default">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`w-5 h-5 ${i < Math.round(driver.rating || 0) ? 'fill-current' : ''}`} />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">({(driver.rating || 0).toFixed(1)})</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export default function DriverProfilePage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('DriverProfilePage must be used within an AppProvider');
    }

    const { user, drivers, loading, translations: t, logout } = context;

    const driverProfile = user ? drivers.find(d => d.id === user.uid) : null;

    if (loading || !user || !t.home || !driverProfile) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="container mx-auto py-8 px-4 flex flex-col h-full">
            <div className="flex-grow space-y-4">
                <ProfileCard driver={driverProfile} t={t} />

                <Link href="/driver/profile/diagnostics">
                    <Button variant="outline" className="w-full justify-between h-16 text-left">
                       <div className="flex items-center gap-4">
                         <FileText className="h-6 w-6 text-primary" />
                         <div>
                            <p className="font-semibold">{t.diagnostics_title || "Diagnostics"}</p>
                            <p className="text-sm text-muted-foreground">{t.diagnostics_profile_button_desc || "Submit or check your verification status"}</p>
                         </div>
                       </div>
                       <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </Link>

                <Link href="/driver/profile/announcement-history">
                    <Button variant="outline" className="w-full justify-between h-16 text-left">
                       <div className="flex items-center gap-4">
                         <History className="h-6 w-6 text-primary" />
                         <div>
                            <p className="font-semibold">{t.announcement_history_title || "Announcement History"}</p>
                            <p className="text-sm text-muted-foreground">{t.announcement_history_desc || "View your past ride announcements"}</p>
                         </div>
                       </div>
                       <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </Link>
            </div>
            <div className="mt-8">
                 <Button variant="destructive" className="w-full h-12" onClick={logout}>
                    <LogOut className="mr-2 h-5 w-5"/>
                    {t.logout}
                </Button>
            </div> 
        </div>
    );
}
