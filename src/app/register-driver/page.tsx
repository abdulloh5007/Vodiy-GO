'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPhoneNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


function RegisterDriverSkeleton() {
    return (
         <div className="container mx-auto py-8 px-4 flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

const TOTAL_STEPS = 2;

export default function RegisterDriverPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [phone, setPhone] = useState('+998');
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [carPhotoUrl, setCarPhotoUrl] = useState('');

  if (!context) {
    throw new Error('RegisterDriverPage must be used within an AppProvider');
  }

  const { user, addDriverApplication, translations, drivers, loading } = context;
  const t = translations;

  const driverProfile = user ? drivers.find(d => d.id === user.uid) : undefined;
  
  useEffect(() => {
      if (driverProfile) {
          setName(driverProfile.name || '');
          setIdCardNumber(driverProfile.idCardNumber || '');
          setPhone(driverProfile.phone || '+998');
          setCarModel(driverProfile.carModel || '');
          setCarNumber(driverProfile.carNumber || '');
          setCarPhotoUrl(driverProfile.carPhotoUrl || '');
      }
  }, [driverProfile]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };
  
  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !idCardNumber) {
        toast({
          title: "Validation Error",
          description: "Please fill all fields for this step.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  if (loading || !t.home) {
    return <RegisterDriverSkeleton />;
  }

  if (!user) {
     return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert className="text-destructive h-8 w-8"/>{t.accessDenied}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t.loginPrompt}</p>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !idCardNumber || phone.replace(/\D/g, '').length !== 12 || !carModel || !carNumber || !carPhotoUrl) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields. Phone number must be complete.",
        variant: "destructive",
      });
      return;
    }
    
    if (user) {
        await addDriverApplication({ name, idCardNumber, phone, carModel, carNumber, carPhotoUrl });

        toast({
            title: t.applicationSubmitted,
            description: t.weWillReviewYourApplication,
        });
        
        router.push('/');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.driverRegistration}</CardTitle>
          <CardDescription>{driverProfile?.status ? `${t.currentStatus}: ${t[driverProfile.status] || driverProfile.status}` : t.fillTheForm}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full mb-6" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t.fullName}</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="idCardNumber">ID Card Number</Label>
                        <Input id="idCardNumber" value={idCardNumber} onChange={e => setIdCardNumber(e.target.value)} required />
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">{t.yourPhone}</Label>
                        <Input id="phone" type="tel" value={phone} onChange={handlePhoneChange} placeholder="+998 (XX) XXX-XX-XX" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carModel">{t.carModel}</Label>
                        <Input id="carModel" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder={t.carModelPlaceholder} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carNumber">{t.carNumber}</Label>
                        <Input id="carNumber" value={carNumber} onChange={e => setCarNumber(e.target.value)} placeholder={t.carNumberPlaceholder} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carPhotoUrl">{t.carPhotoUrl}</Label>
                        <Input id="carPhotoUrl" type="url" value={carPhotoUrl} onChange={e => setCarPhotoUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" required />
                    </div>
                </div>
            )}
            
            <div className="flex justify-between w-full">
                {step > 1 && (
                    <Button type="button" variant="outline" onClick={handlePrevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                )}
                {step < TOTAL_STEPS && (
                    <Button type="button" className="ml-auto" onClick={handleNextStep}>Next Step</Button>
                )}
                {step === TOTAL_STEPS && (
                     <Button type="submit" className="w-full">{driverProfile && driverProfile.status !== 'unsubmitted' ? t.updateApplication : t.submitApplication}</Button>
                )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
