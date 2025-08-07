
'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, EyeOff } from 'lucide-react';


function DriverLoginSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <Skeleton className="h-10 w-full" />
                     <div className="mt-4 text-center text-sm">
                        <Skeleton className="h-5 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function DriverLoginPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (!context) {
    throw new Error('LoginPage must be used within an AppProvider');
  }

  const { user, login, translations, loading } = context;
  const t = translations;

  useEffect(() => {
    if (!loading && user && user.role === 'driver') {
      router.push('/driver/create-ride');
    }
  }, [user, loading, router]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t.validationErrorTitle,
        description: t.validationErrorDesc,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password, 'driver');
      toast({
        title: t.loginSuccessTitle,
        description: t.redirecting,
      });
      router.push('/driver/create-ride');
    } catch (error) {
        let errorMessage = t.unknownError;
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/invalid-credential':
                    errorMessage = t.errorInvalidCredential;
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = t.errorEmailInUse;
                    break;
                case 'auth/weak-password':
                    errorMessage = t.errorWeakPassword;
                    break;
                default:
                    errorMessage = t.unknownAuthError;
            }
        } else if (error instanceof Error && error.message === 'auth/unauthorized-role') {
             errorMessage = t.unauthorizedAccess;
        }

      toast({
        title: t.loginFailedTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (!t.home || loading || (user && user.role === 'driver')) {
      return <DriverLoginSkeleton />
  }

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{t.loginAsDriver}</CardTitle>
                <CardDescription>{t.loginDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                         <div className="relative">
                            <Input id="login-password" type={isPasswordVisible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>{t.login}</Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    {t.dontHaveAccount || "Don't have an account?"}{' '}
                    <Link href="/driver/register" className="underline text-primary">
                        {t.register || 'Register'}
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
