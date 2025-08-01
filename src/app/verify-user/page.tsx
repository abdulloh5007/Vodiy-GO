'use client';

import { useState, useContext, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { CustomOtpInput } from '@/components/CustomOtpInput';

function VerifyUserComponent() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState('');

  // Use a ref to ensure useEffect only runs once on mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const phoneFromParams = searchParams.get('phone');
      if (phoneFromParams) {
        setPhone(phoneFromParams);
      } else {
        toast({
          title: "Error",
          description: "No phone number provided for verification.",
          variant: "destructive"
        });
        router.push('/');
      }
    }
  }, [searchParams, router, toast]);

  if (!context) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const { verifyUser, translations: t } = context;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        title: t.validationErrorTitle || "Validation Error",
        description: t.verify_code_length_error || "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await verifyUser(phone, code);
        toast({
            title: t.registrationSuccessTitle || "Registration Successful",
            description: t.loginSuccessTitle || "Login Successful",
        });
        router.push('/');
    } catch(error: any) {
        let errorMessage = t.unknownError;
        if (error.message.startsWith('verification/')) {
           errorMessage = t[error.message.replace('/', '_')] || t.unknownError;
        }
        toast({
            title: t.registrationFailedTitle || "Registration Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">{t.verify_account_title || "Verify Your Account"}</CardTitle>
          <CardDescription>
            {(t.verify_account_desc || "Enter the 6-digit code sent by the administrator to {phone}.").replace('{phone}', phone)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2 flex flex-col items-center">
                <CustomOtpInput
                    value={code}
                    onChange={setCode}
                    numInputs={6}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || code.length < 6}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.verify_button || "Verify & Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyUserPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <VerifyUserComponent />
        </Suspense>
    )
}
