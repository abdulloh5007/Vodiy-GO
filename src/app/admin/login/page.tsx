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
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!context) {
    throw new Error('AdminLoginPage must be used within an AppProvider');
  }

  const { user, login, translations, loading } = context;
  const t = translations;

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, loading, router]);


  const handleLogin = async (e: React.FormEvent) => {
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
      await login(email, password, 'admin');
      toast({
        title: t.loginSuccessTitle,
        description: t.redirecting,
      });
      router.push('/admin');
    } catch (error) {
        let errorMessage = t.unknownError;
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                    errorMessage = t.errorInvalidCredential;
                    break;
                case 'auth/wrong-password':
                     errorMessage = t.errorInvalidCredential;
                    break;
                default:
                    errorMessage = t.unknownAuthError;
            }
        } else if (error instanceof Error && (error.message === 'auth/unauthorized-role' || error.message === 'auth/no-user-record')) {
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
  
  if (!t.home || loading || (user && user.role === 'admin')) {
      return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldCheck className="h-6 w-6"/>{t.loginAsAdmin}</CardTitle>
                <CardDescription>{t.adminLoginDescription || "Enter your admin credentials to access the dashboard."}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
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
    </div>
  );
}
