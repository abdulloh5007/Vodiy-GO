

'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/AppContext';
import { Ride, User } from '@/lib/types';
import { User as UserIcon, Car, Tag, ArrowRight, Clock, LogIn, ShieldCheck, Armchair, Loader2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ru, uz } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FirebaseError } from 'firebase/app';


interface RideCardProps {
  ride: Ride;
  onImageClick: (url: string) => void;
}

export function RideCard({ ride, onImageClick }: RideCardProps) {
  const context = useContext(AppContext);
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { toast } = useToast();

  if (!context) return null;
  const { drivers, translations, language, addOrder, user, loading, orders, requestUserRegistration } = context;
  const t = translations;

  const driver = drivers.find(d => d.id === ride.driverId);
  
  const existingOrderForThisRide = useMemo(() => {
    if (!user) return null;
    return orders.find(o => o.rideId === ride.id && o.passengerId === user.uid);
  }, [user, orders, ride.id]);

  const hasActiveOrder = useMemo(() => {
    if (!user) return false;
    return orders.some(o => o.passengerId === user.uid && (o.status === 'new' || o.status === 'accepted'));
  }, [user, orders]);


  if (!driver || ride.availableSeats <= 0) return null;
  
  const handleBooking = async () => {
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
     if (user.role !== 'passenger') {
         toast({
            title: t.error,
            description: t.driversCannotBook,
            variant: 'destructive',
         });
         return;
    }

    if (user.status === 'blocked') {
        toast({
            title: t.user_blocked_title || "Account Blocked",
            description: (t.user_blocked_desc || "You cannot book rides because your account is blocked. Reason: {reason}").replace('{reason}', user.blockReason || t.reason_not_specified),
            variant: 'destructive',
            duration: 10000
        });
        return;
    }
    
    await addOrder({
        rideId: ride.id,
        passengerId: user.uid,
        clientName: user.name || 'Unknown',
        clientPhone: user.phone || 'Not specified',
    });
    
    toast({
        title: t.bookingRequestSent,
        description: t.bookingRequestSent_desc,
    });
    router.push('/my-orders');
  };
  
  if (!t.home) {
      return null;
  }

  const formattedPrice = new Intl.NumberFormat('fr-FR').format(ride.price);
  
  const getRideApprovedTime = () => {
      if (!ride.approvedAt) return null;
      const locale = language === 'ru' ? ru : language === 'uz' ? uz : undefined;
      const date = ride.approvedAt.toDate();
      return formatDistanceToNow(date, { addSuffix: true, locale });
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={driver.carPhotoFrontUrl}
              alt={driver.carModel}
              fill
              className="object-cover cursor-pointer"
              data-ai-hint="car side"
              onClick={() => onImageClick(driver.carPhotoFrontUrl)}
            />
             {ride.approvedAt && (
                <Badge variant="secondary" className="absolute bottom-2 right-2">
                    {t.published_ago || 'Published'} {getRideApprovedTime()}
                </Badge>
            )}
          </div>
          <div className="p-4">
            <CardTitle className="font-headline text-xl flex items-center justify-between">
                <span className="flex items-center gap-2">{ride.from} <ArrowRight className="h-5 w-5" /> {ride.to}</span>
            </CardTitle>
            <CardDescription className="flex flex-col gap-2 pt-2">
                 <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    {formattedPrice} UZS / {t.pricePerSeat}
                 </div>
                 {ride.time && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{t.departureTime}: {ride.time}</span>
                    </div>
                 )}
                 <div className="flex items-center gap-2">
                    <Armchair className="h-4 w-4 text-primary" />
                    <span>{ride.availableSeats} {t.seatsAvailable || 'seats available'}</span>
                </div>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold mr-1">{t.driver}:</span>
              <span>{driver.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold mr-1">{t.car}:</span>
              <span>{driver.carModel} ({driver.carNumber})</span>
            </div>
            {ride.info && <p className="text-muted-foreground pt-2 border-t mt-3">{ride.info}</p>}
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <Button 
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground" 
            onClick={handleBooking}
            disabled={!!existingOrderForThisRide || hasActiveOrder}
            title={hasActiveOrder && !existingOrderForThisRide ? t.one_booking_limit_alert : ""}
          >
            {existingOrderForThisRide ? t.bookingRequestSent : t.bookNow}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent>
          <AuthTabs onAuthSuccess={(phone?: string) => {
              setIsAuthModalOpen(false);
              if (phone) {
                 router.push(`/verify-user?phone=${encodeURIComponent(phone)}`);
              } else {
                 router.refresh();
              }
          }} />
        </DialogContent>
      </Dialog>
    </>
  );
}


function AuthTabs({ onAuthSuccess }: { onAuthSuccess: (phone?: string) => void }) {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations: t } = context;

    return (
        <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="register">{t.register}</TabsTrigger>
                <TabsTrigger value="login">{t.login}</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
                <DialogHeader className="mb-4 text-left">
                    <DialogTitle>{t.register_passenger_title || 'Register as Passenger'}</DialogTitle>
                    <DialogDescription>{t.register_passenger_desc || 'Create an account to book rides.'}</DialogDescription>
                </DialogHeader>
                <RegisterForm onAuthSuccess={onAuthSuccess} />
            </TabsContent>
            <TabsContent value="login">
                <DialogHeader className="mb-4 text-left">
                    <DialogTitle>{t.login_passenger_title || 'Login as Passenger'}</DialogTitle>
                    <DialogDescription>{t.login_passenger_desc || 'Enter your credentials to log in.'}</DialogDescription>
                </DialogHeader>
                <LoginForm onAuthSuccess={onAuthSuccess} />
            </TabsContent>
        </Tabs>
    );
}

function RegisterForm({ onAuthSuccess }: { onAuthSuccess: (phone: string) => void }) {
    const context = useContext(AppContext);
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+998');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    if (!context) return null;
    const { translations: t, requestUserRegistration } = context;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!name || phone.replace(/\D/g, '').length !== 12 || password.length < 6) {
                toast({ title: t.validationErrorTitle, description: t.validationErrorDescRegister, variant: "destructive" });
                setIsSubmitting(false);
                return;
            }
            
            await requestUserRegistration(name, phone, password);
            toast({ 
                title: t.registration_request_sent_title || "Request Sent!", 
                description: (t.registration_request_sent_desc || "Admin will send a code to {phone} via SMS.").replace('{phone}', phone),
                duration: 10000 
            });
            onAuthSuccess(phone);
        } catch (error: any) {
            let errorMessage = t.unknownError;
             if (error.message.startsWith('registration/')) {
                errorMessage = t[error.message.replace('/', '_')] || t.unknownError;
            }
            toast({ title: t.registrationFailedTitle, description: errorMessage, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="register-name">{t.fullName}</Label>
                <Input id="register-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-phone">{t.yourPhone}</Label>
                <Input id="register-phone" type="tel" value={phone} onChange={handlePhoneChange} required disabled={isSubmitting}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="register-password">{t.password}</Label>
                <div className="relative">
                    <Input 
                        id="register-password" 
                        type={isPasswordVisible ? "text" : "password"} 
                        value={password} onChange={e => setPassword(e.target.value)} 
                        required 
                        disabled={isSubmitting}
                    />
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : t.register}
            </Button>
        </form>
    );
}


function LoginForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
    const context = useContext(AppContext);
    const { toast } = useToast();
    
    const [phone, setPhone] = useState('+998');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    if (!context) return null;
    const { translations: t, loginWithPhone } = context;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await loginWithPhone(phone, password, 'passenger');
            toast({ title: t.loginSuccessTitle });
            onAuthSuccess();
        } catch (error: any) {
            let errorMessage = t.unknownError;
            if (error instanceof FirebaseError || error.message.startsWith('auth/')) {
                const errorCode = error.code || error.message;
                 switch (errorCode) {
                    case 'auth/invalid-credential':
                    case 'auth/wrong-password':
                    case 'auth/user-not-found':
                    case 'auth/invalid-email': // happens if phone number is not yet in auth
                        errorMessage = t.errorInvalidCredential;
                        break;
                    case 'auth/unauthorized-role':
                        errorMessage = t.unauthorizedAccess;
                        break;
                    default:
                        console.error("Login error:", error);
                        errorMessage = t.unknownAuthError;
                }
            }
            toast({ title: t.loginFailedTitle, description: errorMessage, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="login-phone">{t.yourPhone}</Label>
                <Input id="login-phone" type="tel" value={phone} onChange={handlePhoneChange} required disabled={isSubmitting}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="login-password">{t.password}</Label>
                <div className="relative">
                    <Input 
                      id="login-password" 
                      type={isPasswordVisible ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      disabled={isSubmitting} 
                    />
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : t.login}
            </Button>
        </form>
    );
}
