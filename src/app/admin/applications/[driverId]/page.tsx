'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, User, Car, Hash, Check, X, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { RejectionDialog } from '@/components/RejectionDialog';
import { AdminPanelWrapper } from '@/components/AdminPanelWrapper';

function ApplicationDetailPageContent() {
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
                    <CardContent className="space-y-8 pt-6">
                        {/* Driver Info */}
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

                        <hr />

                        {/* Personal Documents */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">{t.personal_documents || 'Personal Documents'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PhotoCard title={t.passport_front_side || 'Passport (front)'} src={driver.passportFrontUrl} onImageClick={setSelectedImage} />
                                <PhotoCard title={t.selfie_photo || 'Facial Photo'} src={driver.selfieUrl} onImageClick={setSelectedImage} />
                            </div>
                        </div>

                        <hr />

                        {/* Car Photos */}
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
                        
                        {/* Tech Passport */}
                         <div>
                            <h3 className="text-lg font-semibold mb-4">{t.techPassport || 'Vehicle Registration Certificate'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <PhotoCard title={t.tech_passport_front || 'Tech Passport (front)'} src={driver.techPassportFrontUrl} onImageClick={setSelectedImage} />
                               <PhotoCard title={t.tech_passport_back || 'Tech Passport (back)'} src={driver.techPassportBackUrl} onImageClick={setSelectedImage} />
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


export default function ApplicationDetailPage() {
    return (
        <AdminPanelWrapper>
            <ApplicationDetailPageContent />
        </AdminPanelWrapper>
    )
}
