'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';


export default function DriverRegisterPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!context) {
    throw new Error('RegisterDriverPage must be used within an AppProvider');
  }

  const { register, translations: t } = context;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || password.length < 6) {
      toast({
        title: t.validationErrorTitle,
        description: t.validationErrorDescStep1 || "Please enter a valid name, email, and a password of at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await register(email, password, name, 'driver');
        toast({
            title: t.registrationSuccessTitle,
            description: t.redirectingToApplication,
        });
        router.push('/driver/application');
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.driverRegistration}</CardTitle>
          <CardDescription>{t.registerDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="name">{t.fullName}</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isSubmitting} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.register}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {t.alreadyHaveAccount || "Already have an account?"}{' '}
            <Link href="/driver/login" className="underline text-primary">
                {t.login || 'Login'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
