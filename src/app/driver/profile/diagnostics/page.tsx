

'use client';

import { useState, useContext, useMemo, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, UploadCloud, X, ArrowRight, CheckCircle2, ShieldX, ShieldAlert, Ban } from 'lucide-react';
import { formatCarNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Driver } from '@/lib/types';
import { IdCardFront, IdCardBack } from '@/components/icons';


const MAX_FILE_SIZE_MB = 32;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ImageDropzone = ({ 
    file, 
    setFile, 
    t, 
    disabled, 
    placeholderIcon,
    placeholderText 
}: { 
    file: File | null, 
    setFile: (file: File | null) => void, 
    t: any, 
    disabled: boolean,
    placeholderIcon?: ReactNode,
    placeholderText?: string
}) => {
    const [preview, setPreview] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [file]);

    const handleFile = (selectedFile: File | null | undefined) => {
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            toast({
                variant: 'destructive',
                title: t.fileTooLargeTitle || 'File is too large',
                description: (t.fileTooLargeDesc || 'Maximum file size is {size}MB.').replace('{size}', MAX_FILE_SIZE_MB.toString()),
            });
            return;
        }

        if (selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
        } else {
             toast({
                variant: 'destructive',
                title: t.invalidFileTypeTitle || 'Invalid file type',
                description: t.invalidFileTypeDesc || 'Please upload an image file.',
            });
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const selectedFile = e.target.files?.[0];
        handleFile(selectedFile);
    };

    return (
        <div 
            className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 aspect-[16/10] flex flex-col items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById(`file-upload-${placeholderText}`)?.click()}
            data-disabled={disabled}
        >
            <input id={`file-upload-${placeholderText}`} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={disabled} />
            {preview ? (
                <>
                    <Image src={preview} alt="Preview" layout="fill" className="rounded-md object-cover" />
                    <Button 
                        variant="destructive" 
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 z-10"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {placeholderIcon || <UploadCloud className="h-10 w-10"/>}
                    <span className='mt-2 text-sm'>{placeholderText || t.carPhotoDropzone}</span>
                </div>
            )}
        </div>
    )
}

const TOTAL_STEPS = 3;

export default function DriverDiagnosticsPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passportFrontFile, setPassportFrontFile] = useState<File | null>(null);
  const [passportBackFile, setPassportBackFile] = useState<File | null>(null);
  
  // Step 2
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [carPhotoFrontFile, setCarPhotoFrontFile] = useState<File | null>(null);
  const [carPhotoBackFile, setCarPhotoBackFile] = useState<File | null>(null);
  const [carPhotoLeftFile, setCarPhotoLeftFile] = useState<File | null>(null);
  const [carPhotoRightFile, setCarPhotoRightFile] = useState<File | null>(null);

  // Step 3
  const [techPassportFrontFile, setTechPassportFrontFile] = useState<File | null>(null);
  const [techPassportBackFile, setTechPassportBackFile] = useState<File | null>(null);


  if (!context) {
    throw new Error('DriverDiagnosticsPage must be used within an AppProvider');
  }

  const { addDriverApplication, translations: t, user, drivers, loading, deleteDriver } = context;

  const driverProfile = useMemo(() => {
    if (!user) return null;
    return drivers.find(d => d.id === user.uid);
  }, [user, drivers]);

  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCarNumber(e.target.value);
    setCarNumber(formatted);
  };
  
  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!firstName || !lastName || !passportFrontFile || !passportBackFile) {
        toast({
          title: t.validationErrorTitle,
          description: t.validationErrorDescStep1,
          variant: "destructive",
        });
        return;
      }
    }
     if (step === 2) {
      if (!carModel || !carNumber || !carPhotoFrontFile || !carPhotoBackFile || !carPhotoLeftFile || !carPhotoRightFile) {
        toast({
          title: t.validationErrorTitle,
          description: t.validationErrorDescStep2,
          variant: "destructive",
        });
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== TOTAL_STEPS) return;
    
    if (!techPassportFrontFile || !techPassportBackFile) {
       toast({
          title: t.validationErrorTitle,
          description: t.validationErrorDescStep3,
          variant: "destructive",
        });
      return;
    }
    
    if (!passportFrontFile || !passportBackFile || !carPhotoFrontFile || !carPhotoBackFile || !carPhotoLeftFile || !carPhotoRightFile) {
         toast({
          title: t.validationErrorTitle,
          description: t.allPhotosRequired,
          variant: "destructive",
        });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await addDriverApplication({ 
            name: `${firstName} ${lastName}`,
            carModel, 
            carNumber,
            passportFrontFile,
            passportBackFile,
            carPhotoFrontFile,
            carPhotoBackFile,
            carPhotoLeftFile,
            carPhotoRightFile,
            techPassportFrontFile,
            techPassportBackFile
        });

        toast({
            title: t.applicationSubmitted,
            description: t.weWillReviewYourApplication,
        });
        // After submission, the driver profile will exist, and the status page will be shown.
        
    } catch(error) {
        console.error("Application submission failed:", error);
        toast({
            title: t.registrationFailedTitle,
            description: t.unknownError,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || !user || !t.home) {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }
  
  if (driverProfile) {
    return <DriverStatusPage driverProfile={driverProfile} t={t} deleteDriver={deleteDriver} />
  }

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
             </Button>
            <div>
              <CardTitle className="font-headline text-2xl">{t.diagnostics_title || "Diagnostics"}</CardTitle>
              <CardDescription>{t.diagnostics_desc || "Fill the form to complete your profile."}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full mb-6" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription className="font-semibold text-lg">{t.step1_title || "Step 1: Personal Information"}</CardDescription>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">{t.firstName || 'First Name'}</Label>
                            <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">{t.lastName || 'Last Name'}</Label>
                            <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                           <Label htmlFor="passport-front">{t.passport_front_side || "Passport (front)"}</Label>
                           <ImageDropzone 
                                file={passportFrontFile} 
                                setFile={setPassportFrontFile} 
                                t={t} 
                                disabled={isSubmitting} 
                                placeholderIcon={<IdCardFront className="w-16 h-16" />}
                                placeholderText={t.passport_front_side || "Passport (front)"}
                            />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="passport-back">{t.passport_back_side || "Passport (back)"}</Label>
                           <ImageDropzone 
                                file={passportBackFile} 
                                setFile={setPassportBackFile} 
                                t={t} 
                                disabled={isSubmitting}
                                placeholderIcon={<IdCardBack className="w-16 h-16" />}
                                placeholderText={t.passport_back_side || "Passport (back)"}
                            />
                       </div>
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription className="font-semibold text-lg">{t.step2_title || "Step 2: Car Information"}</CardDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="carModel">{t.carModel}</Label>
                            <Input id="carModel" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder={t.carModelPlaceholder} required disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="carNumber">{t.carNumber}</Label>
                            <Input id="carNumber" value={carNumber} onChange={handleCarNumberChange} placeholder="e.g., 01 B 123 BB" required disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageDropzone file={carPhotoFrontFile} setFile={setCarPhotoFrontFile} t={t} disabled={isSubmitting} placeholderIcon={<UploadCloud className="w-12 h-12"/>} placeholderText={t.car_photo_front || "Front View"} />
                        <ImageDropzone file={carPhotoBackFile} setFile={setCarPhotoBackFile} t={t} disabled={isSubmitting} placeholderIcon={<UploadCloud className="w-12 h-12"/>} placeholderText={t.car_photo_rear || "Rear View"}/>
                        <ImageDropzone file={carPhotoLeftFile} setFile={setCarPhotoLeftFile} t={t} disabled={isSubmitting} placeholderIcon={<UploadCloud className="w-12 h-12"/>} placeholderText={t.car_photo_side_left || "Left Side"}/>
                        <ImageDropzone file={carPhotoRightFile} setFile={setCarPhotoRightFile} t={t} disabled={isSubmitting} placeholderIcon={<UploadCloud className="w-12 h-12"/>} placeholderText={t.car_photo_side_right || "Right Side"}/>
                    </div>
                </div>
            )}
             {step === 3 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription className="font-semibold text-lg">{t.step3_title || "Step 3: Car Documents"}</CardDescription>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                           <Label htmlFor="tech-passport-front">{t.tech_passport_front || "Tech Passport (front)"}</Label>
                           <ImageDropzone 
                                file={techPassportFrontFile} 
                                setFile={setTechPassportFrontFile} 
                                t={t} 
                                disabled={isSubmitting} 
                                placeholderIcon={<IdCardFront className="w-16 h-16" />}
                                placeholderText={t.tech_passport_front || "Tech Passport (front)"}
                            />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="tech-passport-back">{t.tech_passport_back || "Tech Passport (back)"}</Label>
                           <ImageDropzone 
                                file={techPassportBackFile} 
                                setFile={setTechPassportBackFile} 
                                t={t} 
                                disabled={isSubmitting}
                                placeholderIcon={<IdCardBack className="w-16 h-16" />}
                                placeholderText={t.tech_passport_back || "Tech Passport (back)"}
                            />
                       </div>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between w-full pt-4">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t.back_button || 'Back'}
                    </Button>
                ) : <div />}
                
                {step < TOTAL_STEPS ? (
                    <Button type="button" onClick={handleNextStep}>
                        {t.next_button || 'Next Step'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.submitApplication}
                    </Button>
                )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


const DriverStatusPage = ({ driverProfile, t, deleteDriver }: { driverProfile: Driver, t: any, deleteDriver: (id: string) => Promise<void>}) => {
    
    const getStatusContent = () => {
        const remainingAttempts = 3 - driverProfile.rejectionCount;

        switch (driverProfile.status) {
            case 'pending':
                return {
                    icon: <ShieldAlert className="h-16 w-16 text-yellow-500" />,
                    title: t.statusPage_pending_title || "Application Pending",
                    description: t.statusPage_pending_desc || "Your application is under review. We will notify you once it's processed.",
                    rejectionReason: null,
                    actionButton: null,
                };
            case 'verified':
                return {
                     icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
                     title: t.diagnostics_complete_title || "Diagnostics Complete",
                     description: t.diagnostics_complete_desc || "Your profile is verified. You can now publish and manage rides.",
                     rejectionReason: null,
                     actionButton: null,
                };
            case 'rejected':
                return {
                    icon: <ShieldX className="h-16 w-16 text-destructive" />,
                    title: t.statusPage_rejected_title || "Application Rejected",
                    description: t.statusPage_rejected_desc || "We're sorry, but your application could not be approved at this time.",
                    rejectionReason: driverProfile.rejectionReason,
                    actionButton: (
                        <div className='w-full space-y-2'>
                             <Button className="w-full" onClick={() => deleteDriver(driverProfile.id)}>
                                {t.resubmit_application_button || 'Submit Application Again'}
                             </Button>
                             <p className='text-xs text-muted-foreground'>{t.attempts_left.replace('{count}', remainingAttempts)}</p>
                        </div>
                    ),
                };
            case 'blocked':
                return {
                    icon: <Ban className="h-16 w-16 text-destructive" />,
                    title: t.statusPage_blocked_title || "Account Blocked",
                    description: t.statusPage_blocked_desc || "Your account has been blocked by an administrator.",
                    rejectionReason: driverProfile.rejectionReason,
                    actionButton: (
                        <Button variant="secondary" className="w-full">
                           {t.contact_support || 'Contact Support'}
                        </Button>
                    ),
                };
            default:
                return {
                    icon: <Loader2 className="h-16 w-16 animate-spin" />,
                    title: t.statusPage_checking_title || "Checking Status...",
                    description: t.statusPage_checking_desc || "Please wait while we check your application status.",
                    rejectionReason: null,
                    actionButton: null,
                };
        }
    };
    
    const {icon, title, description, rejectionReason, actionButton} = getStatusContent();
    
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center">
             <Card className="w-full max-w-md text-center">
                <CardHeader className="items-center">
                    {icon}
                    <CardTitle className="mt-4">{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CardDescription>{description}</CardDescription>
                    {rejectionReason && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                            <p className="font-semibold mb-1">{t.reason || 'Reason'}:</p>
                            <p>{rejectionReason}</p>
                        </div>
                    )}
                </CardContent>
                {actionButton && (
                    <CardFooter className="flex flex-col gap-4">
                        {actionButton}
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}

    