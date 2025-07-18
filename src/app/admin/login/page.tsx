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

export default function LoginPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!context) {
    throw new Error('LoginPage must be used within an AppProvider');
  }

  const { login, register, language, translations } = context;
  const t = translations;

  const handleAuth = async (action: 'login' | 'register', e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (action === 'login') {
        await login(email, password);
        toast({
          title: "Login Successful",
          description: "Redirecting...",
        });
      } else {
        await register(email, password);
        toast({
          title: "Registration Successful",
          description: "Redirecting...",
        });
      }
      router.push('/');
    } catch (error) {
      toast({
        title: action === 'login' ? "Login Failed" : "Registration Failed",
        description: (error as Error).message,
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
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t.loginAsDriver}</CardTitle>
                        <CardDescription>Enter your credentials to access your account.</CardDescription>
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
                            <Button type="submit" className="w-full" disabled={isSubmitting}>Login</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Register as a Driver</CardTitle>
                        <CardDescription>Create a new account to get started.</CardDescription>
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
                            <Button type="submit" className="w-full" disabled={isSubmitting}>Register</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
