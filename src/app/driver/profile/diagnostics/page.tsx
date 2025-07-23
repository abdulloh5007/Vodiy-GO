
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, UploadCloud, X, ArrowRight, CheckCircle2, ShieldX, ShieldAlert } from 'lucide-react';
import { formatCarNumber, formatPassportNumber, formatTechPassportNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Driver } from '@/lib/types';


const ImageDropzone = ({ file, setFile, t, disabled }: { file: File | null, setFile: (file: File | null) => void, t: any, disabled: boolean }) => {
    const [preview, setPreview] = useState<string | null>(null);

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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    return (
        <div 
            className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById('file-upload')?.click()}
            data-disabled={disabled}
        >
            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={disabled} />
            {preview ? (
                <>
                    <Image src={preview} alt="Car preview" width={200} height={120} className="mx-auto rounded-md object-cover" />
                    <Button 
                        variant="destructive" 
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-10 w-10"/>
                    <span>{t.carPhotoDropzone || 'Drag & drop or click to upload car photo'}</span>
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
  const [passport, setPassport] = useState('');
  
  // Step 2
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [carPhotoFile, setCarPhotoFile] = useState<File | null>(null);

  // Step 3
  const [techPassport, setTechPassport] = useState('');


  if (!context) {
    throw new Error('DriverDiagnosticsPage must be used within an AppProvider');
  }

  const { addDriverApplication, translations: t, user, drivers, loading } = context;

  const driverProfile = useMemo(() => {
    if (!user) return null;
    return drivers.find(d => d.id === user.uid);
  }, [user, drivers]);

  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCarNumber(e.target.value);
    setCarNumber(formatted);
  };
   const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPassportNumber(e.target.value);
    setPassport(formatted);
  };
   const handleTechPassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTechPassportNumber(e.target.value);
    setTechPassport(formatted);
  };
  
  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!firstName || !lastName || passport.length < 9) {
        toast({
          title: t.validationErrorTitle,
          description: t.validationErrorDescStep1,
          variant: "destructive",
        });
        return;
      }
    }
     if (step === 2) {
      if (!carModel || !carNumber || !carPhotoFile) {
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
    
    if (techPassport.length < 9) {
       toast({
          title: t.validationErrorTitle,
          description: t.validationErrorDescStep3,
          variant: "destructive",
        });
      return;
    }
    
    if (!carPhotoFile) {
         toast({
          title: t.validationErrorTitle,
          description: t.carPhotoRequired,
          variant: "destructive",
        });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await addDriverApplication({ 
            name: `${firstName} ${lastName}`,
            passport, 
            carModel, 
            carNumber, 
            techPassport,
            carPhotoFile
        });

        toast({
            title: t.applicationSubmitted,
            description: t.weWillReviewYourApplication,
        });
        // After submission, the driver profile will exist, and the status page will be shown.
        // No need to redirect here, the component will re-render with the new status.
        
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
  
  // If a driver profile exists, show their status instead of the application form
  if (driverProfile) {
    return <DriverStatusPage driverProfile={driverProfile} t={t} router={router} />
  }

  // If no driver profile, show the application form
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
                    <CardDescription>{t.step1_title || "Step 1: Personal Information"}</CardDescription>
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
                    <div className="space-y-2">
                        <Label htmlFor="passport">{t.passportNumber || "Passport Number"}</Label>
                        <Input id="passport" value={passport} onChange={handlePassportChange} placeholder={t.passportPlaceholder || "AA 1234567"} required disabled={isSubmitting} />
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription>{t.step2_title || "Step 2: Car Information"}</CardDescription>
                    <div className="space-y-2">
                        <Label htmlFor="carModel">{t.carModel}</Label>
                        <Input id="carModel" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder={t.carModelPlaceholder} required disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carNumber">{t.carNumber}</Label>
                        <Input id="carNumber" value={carNumber} onChange={handleCarNumberChange} placeholder="e.g., 01 B 123 BB" required disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carPhotoUrl">{t.carPhotoUrl}</Label>
                        <ImageDropzone file={carPhotoFile} setFile={setCarPhotoFile} t={t} disabled={isSubmitting} />
                    </div>
                </div>
            )}
             {step === 3 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription>{t.step3_title || "Step 3: Car Documents"}</CardDescription>
                    <div className="space-y-2">
                        <Label htmlFor="techPassport">{t.techPassport || "Vehicle Registration Certificate (Tech Passport)"}</Label>
                        <Input id="techPassport" value={techPassport} onChange={handleTechPassportChange} placeholder={t.passportPlaceholder || "AAF 1234567"} required disabled={isSubmitting} />
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


const DriverStatusPage = ({ driverProfile, t, router }: { driverProfile: Driver, t: any, router: any}) => {
    
    const getStatusContent = () => {
        switch (driverProfile.status) {
            case 'pending':
                return {
                    icon: <ShieldAlert className="h-16 w-16 text-yellow-500" />,
                    title: t.statusPage_pending_title || "Application Pending",
                    description: t.statusPage_pending_desc || "Your application is under review. We will notify you once it's processed.",
                };
            case 'verified':
                return {
                     icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
                     title: t.diagnostics_complete_title || "Diagnostics Complete",
                     description: t.diagnostics_complete_desc || "Your profile is verified. You can now publish and manage rides.",
                };
            case 'rejected':
                return {
                    icon: <ShieldX className="h-16 w-16 text-destructive" />,
                    title: t.statusPage_rejected_title || "Application Rejected",
                    description: t.statusPage_rejected_desc || "We're sorry, but your application could not be approved at this time.",
                };
            default:
                return {
                    icon: <Loader2 className="h-16 w-16 animate-spin" />,
                    title: t.statusPage_checking_title || "Checking Status...",
                    description: t.statusPage_checking_desc || "Please wait while we check your application status.",
                };
        }
    };
    
    const {icon, title, description} = getStatusContent();
    
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center">
             <Card className="w-full max-w-md text-center">
                <CardHeader className="items-center">
                    <div className="absolute top-4 left-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    {icon}
                    <CardTitle className="mt-4">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>{description}</CardDescription>
                </CardContent>
            </Card>
        </div>
    )
}
