
'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Car, Hash, Shield, BadgeCheck, BadgeAlert, BadgeX, Ban, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Driver } from '@/lib/types';
import { RejectionDialog } from '@/components/RejectionDialog';
import { useToast } from '@/hooks/use-toast';

function DriverDetailPageContent() {
    const context = useContext(AppContext);
    const router = useRouter();
    const params = useParams();
    const driverId = params.id as string;
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const { toast } = useToast();

    if (!context) {
        throw new Error('DriverDetailPage must be used within an AppProvider');
    }

    const { drivers, loading, translations: t, setSelectedImage, updateDriverStatus, deleteDriver } = context;

    const driver = drivers.find(d => d.id === driverId);
    
    if (loading || !t.home) {
        return <DriverDetailSkeleton />;
    }
    
    if (!driver) {
        return <div className="container mx-auto py-8 px-4">Driver not found.</div>;
    }
    
    const handleBlock = async (reason: string) => {
        if (!reason) return;
        await updateDriverStatus(driver.id, 'blocked', reason);
    }

    const handleUnblock = async () => {
        // "Unbanning" now means deleting their profile, forcing them to re-apply
        await deleteDriver(driver.id);
        toast({
            title: t.unblock_success_title || "Driver Unblocked",
            description: t.unblock_success_desc || "The driver's profile has been removed. They will need to re-apply.",
        })
        router.push('/admin/drivers');
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
                <CardContent className="space-y-8 pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
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
                    </div>
                     <div className="flex items-start gap-3">
                        <StatusBadge status={driver.status} t={t} />
                    </div>
                    {(driver.status === 'rejected' || driver.status === 'blocked') && driver.rejectionReason && (
                        <div className="p-3 bg-destructive border border-destructive/20 rounded-lg">
                            <p className="text-sm font-semibold">{driver.status === 'rejected' ? t.rejection_reason : t.block_reason}:</p>
                            <p className="text-sm">{driver.rejectionReason}</p>
                        </div>
                    )}

                    <hr />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t.personal_documents || 'Personal Documents'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <PhotoCard title={t.passport_front_side || 'Passport (front)'} src={driver.passportFrontUrl} onImageClick={setSelectedImage} />
                            <PhotoCard title={t.selfie_photo || 'Facial Photo'} src={driver.selfieUrl} onImageClick={setSelectedImage} />
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t.car_photos || 'Car Photos'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <PhotoCard title={t.car_photo_front || 'Front View'} src={driver.carPhotoFrontUrl} onImageClick={setSelectedImage} />
                            <PhotoCard title={t.car_photo_rear || 'Rear View'} src={driver.carPhotoBackUrl} onImageClick={setSelectedImage} />
                            <PhotoCard title={t.car_photo_side_left || 'Left Side'} src={driver.carPhotoLeftUrl} onImageClick={setSelectedImage} />
                            <PhotoCard title={t.car_photo_side_right || 'Right Side'} src={driver.carPhotoRightUrl} onImageClick={setSelectedImage} />
                        </div>
                    </div>
                    
                    <hr />
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t.techPassport || 'Vehicle Registration Certificate'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <PhotoCard title={t.tech_passport_front || 'Tech Passport (front)'} src={driver.techPassportFrontUrl} onImageClick={setSelectedImage} />
                            <PhotoCard title={t.tech_passport_back || 'Tech Passport (back)'} src={driver.techPassportBackUrl} onImageClick={setSelectedImage} />
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {driver.status === 'blocked' ? (
                         <Button variant="secondary" className='bg-green-600 hover:bg-green-700' onClick={handleUnblock}>
                            <CheckCircle2 /> {t.unblock_driver || 'Unblock'}
                        </Button>
                    ) : (
                        driver.status !== 'pending' && (
                            <Button variant="destructive" onClick={() => setIsBlockDialogOpen(true)}>
                                <Ban /> {t.block_driver || 'Block'}
                            </Button>
                        )
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

const PhotoCard = ({ title, src, onImageClick }: { title: string, src: string, onImageClick: (src: string) => void }) => (
    <div className="space-y-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="relative aspect-video w-full">
            <Image 
                src={src} 
                alt={title}
                fill
                className="rounded-lg object-cover cursor-pointer"
                onClick={() => onImageClick(src)}
            />
        </div>
    </div>
);


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
    return (
        <DriverDetailPageContent />
    )
}
