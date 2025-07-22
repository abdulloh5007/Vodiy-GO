'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FirebaseError } from 'firebase/app';

export default function DriverLoginPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!context) {
    throw new Error('LoginPage must be used within an AppProvider');
  }

  const { login, register, translations } = context;
  const t = translations;

  const handleAuth = async (action: 'login' | 'register', e: React.FormEvent) => {
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
      if (action === 'login') {
        await login(email, password, 'driver');
        toast({
          title: t.loginSuccessTitle,
          description: t.redirecting,
        });
      } else {
        await register(email, password, 'driver');
        toast({
          title: t.registrationSuccessTitle,
          description: t.redirecting,
        });
      }
      router.push('/register-driver');
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
        title: action === 'login' ? t.loginFailedTitle : t.registrationFailedTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (!t.home) {
      return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
        <Tabs defaultValue="login" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.login}</TabsTrigger>
                <TabsTrigger value="register">{t.register}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t.loginAsDriver}</CardTitle>
                        <CardDescription>{t.loginDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => handleAuth('login', e)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>{t.login}</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t.registerAsDriver}</CardTitle>
                        <CardDescription>{t.registerDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => handleAuth('register', e)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <Input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>{t.register}</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
