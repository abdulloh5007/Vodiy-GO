
'use client';

import { useState, useContext, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, UploadCloud, X, ArrowRight } from 'lucide-react';
import { formatPhoneNumber, formatCarNumber, formatPassportNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { FirebaseError } from 'firebase/app';


const ImageDropzone = ({ file, setFile, t }: { file: File | null, setFile: (file: File | null) => void, t: any }) => {
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
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    return (
        <div 
            className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {preview ? (
                <>
                    <Image src={preview} alt="Car preview" width={200} height={120} className="mx-auto rounded-md object-cover" />
                    <Button 
                        variant="destructive" 
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
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

export default function NewRegisterDriverPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [passport, setPassport] = useState('');
  
  // Step 3
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [carPhotoFile, setCarPhotoFile] = useState<File | null>(null);

  if (!context) {
    throw new Error('RegisterDriverPage must be used within an AppProvider');
  }

  const { addDriverApplication, translations: t } = context;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };
  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCarNumber(e.target.value);
    setCarNumber(formatted);
  };
   const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPassportNumber(e.target.value);
    setPassport(formatted);
  };
  
  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!email || password.length < 6) {
        toast({
          title: t.validationErrorTitle,
          description: "Please enter a valid email and a password of at least 6 characters.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!name || phone.replace(/\D/g, '').length !== 12 || passport.length < 9) {
        toast({
          title: t.validationErrorTitle,
          description: "Please fill all fields for this step correctly.",
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
    
    if (!carModel || !carNumber || !carPhotoFile) {
      toast({
        title: t.validationErrorTitle,
        description: "Please fill all car details and upload a photo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await addDriverApplication({ 
            email, 
            password,
            name, 
            phone,
            passport, 
            carModel, 
            carNumber, 
            carPhotoFile 
        });

        toast({
            title: t.applicationSubmitted,
            description: t.weWillReviewYourApplication,
        });
        
        router.push('/driver/status');
    } catch(error) {
        let errorMessage = t.unknownError;
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = t.errorEmailInUse;
                    break;
                case 'auth/weak-password':
                    errorMessage = t.errorWeakPassword;
                    break;
                default:
                    errorMessage = t.unknownAuthError;
            }
        }
        toast({
            title: t.registrationFailedTitle,
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.driverRegistration}</CardTitle>
          <CardDescription>{t.fillTheForm}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full mb-6" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription>{t.step1_title || "Step 1: Account Details"}</CardDescription>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.email}</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">{t.password}</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription>{t.step2_title || "Step 2: Personal Information"}</CardDescription>
                    <div className="space-y-2">
                        <Label htmlFor="name">{t.fullName}</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">{t.yourPhone}</Label>
                        <Input id="phone" type="tel" value={phone} onChange={handlePhoneChange} placeholder="+998 (XX) XXX-XX-XX" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="passport">{t.passportNumber || "Passport Number"}</Label>
                        <Input id="passport" value={passport} onChange={handlePassportChange} placeholder={t.passportPlaceholder || "AA 1234567"} required />
                    </div>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in">
                    <CardDescription>{t.step3_title || "Step 3: Car Information"}</CardDescription>
                    <div className="space-y-2">
                        <Label htmlFor="carModel">{t.carModel}</Label>
                        <Input id="carModel" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder={t.carModelPlaceholder} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carNumber">{t.carNumber}</Label>
                        <Input id="carNumber" value={carNumber} onChange={handleCarNumberChange} placeholder="e.g., 01 B 123 BB" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carPhotoUrl">{t.carPhotoUrl}</Label>
                        <ImageDropzone file={carPhotoFile} setFile={setCarPhotoFile} t={t} />
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
