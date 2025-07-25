
'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, User, Car, Hash, Shield, BadgeCheck, BadgeAlert, BadgeX, Trash2, Ban, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Driver } from '@/lib/types';
import { RejectionDialog } from '@/components/RejectionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
        },
        blocked: {
            label: t.blocked || "Blocked",
            icon: <Ban className="h-5 w-5 mr-2 text-red-500" />,
            variant: "destructive"
        }
    }
    const current = statusMap[status];

    if (!current) return null;

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
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

    if (!context) {
        throw new Error('DriverDetailPage must be used within an AppProvider');
    }

    const { drivers, loading, translations: t, setSelectedImage, deleteDriver, updateDriverStatus } = context;

    const driver = drivers.find(d => d.id === driverId);
    
    if (loading || !t.home) {
        return <DriverDetailSkeleton />;
    }
    
    if (!driver) {
        return <div className="container mx-auto py-8 px-4">Driver not found.</div>;
    }
    
    const handleDelete = async () => {
        await deleteDriver(driver.id);
        router.push('/admin/drivers');
    }

    const handleBlock = async (reason: string) => {
        if (!reason) return;
        await updateDriverStatus(driver.id, 'blocked', reason);
        // No need to redirect, status will update on page
    }

    const handleUnblock = async () => {
        await updateDriverStatus(driver.id, 'verified');
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
                         {driver.status === 'rejected' && driver.rejectionReason && (
                            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm font-semibold text-destructive">{t.rejection_reason || 'Rejection Reason'}:</p>
                                <p className="text-sm text-destructive/80">{driver.rejectionReason}</p>
                            </div>
                        )}
                        {driver.status === 'blocked' && driver.rejectionReason && (
                             <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm font-semibold text-destructive">{t.block_reason || 'Block Reason'}:</p>
                                <p className="text-sm text-destructive/80">{driver.rejectionReason}</p>
                            </div>
                        )}
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
                <CardFooter className="flex justify-end gap-2">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline"><Trash2 /> {t.delete_driver || 'Delete'}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>{t.delete_driver_confirm_title || 'Are you sure?'}</AlertDialogTitle>
                            <AlertDialogDescription>
                               {t.delete_driver_confirm_desc || 'This action cannot be undone. This will permanently delete the driver and all associated data.'}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>{t.cancel_button || 'Cancel'}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                {t.delete_button || 'Delete'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    {driver.status === 'blocked' ? (
                         <Button variant="secondary" className='bg-green-600 hover:bg-green-700' onClick={handleUnblock}>
                            <CheckCircle2 /> {t.unblock_driver || 'Unblock'}
                        </Button>
                    ) : (
                        <Button variant="destructive" onClick={() => setIsBlockDialogOpen(true)}>
                            <Ban /> {t.block_driver || 'Block'}
                        </Button>
                    )}

                </CardFooter>
            </Card>
        </div>
        <RejectionDialog 
            isOpen={isBlockDialogOpen}
            onClose={() => setIsBlockDialogOpen(false)}
            onConfirm={handleBlock}
            t={t}
            title={t.block_reason_title || 'Reason for blocking'}
            description={t.block_reason_desc || 'Please specify the reason for blocking this driver.'}
        />
        </>
    );
}
