
'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/AppContext';
import { Ride, User } from '@/lib/types';
import { User as UserIcon, Car, Tag, ArrowRight, Clock, LogIn, ShieldCheck, Armchair, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ru, uz } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { User as FirebaseAuthUser } from 'firebase/auth';

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
  const { drivers, translations, language, addOrder, user, login, register, orders } = context;
  const t = translations;

  const driver = drivers.find(d => d.id === ride.driverId);
  
  const acceptedOrdersCount = orders.filter(o => o.rideId === ride.id && o.status === 'accepted').length;
  const availableSeats = ride.seats - acceptedOrdersCount;

  const existingOrderForThisRide = useMemo(() => {
    if (!user) return null;
    return orders.find(o => o.rideId === ride.id && o.passengerId === user.uid);
  }, [user, orders, ride.id]);

  const hasActiveOrder = useMemo(() => {
    if (!user) return false;
    return orders.some(o => o.passengerId === user.uid && (o.status === 'new' || o.status === 'accepted'));
  }, [user, orders]);


  if (!driver || availableSeats <= 0) return null;
  
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
    
    await addOrder({
        rideId: ride.id,
        passengerId: user.uid,
        clientName: user.name || user.email || 'Unknown',
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
              src={driver.carPhotoUrl}
              alt={driver.carModel}
              fill
              className="object-cover cursor-pointer"
              data-ai-hint="car side"
              onClick={() => onImageClick(driver.carPhotoUrl)}
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
                    <span>{availableSeats} {t.seatsAvailable || 'seats available'}</span>
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
            <Tabs defaultValue="login" className="w-full">
                <DialogHeader className="mb-4">
                    <DialogTitle>{t.auth_modal_title || 'Authentication Required'}</DialogTitle>
                    <DialogDescription>{t.auth_modal_desc || 'Please log in or register to continue.'}</DialogDescription>
                    <TabsList className="grid w-full grid-cols-2 mt-2">
                        <TabsTrigger value="login">{t.login}</TabsTrigger>
                        <TabsTrigger value="register">{t.register}</TabsTrigger>
                    </TabsList>
                </DialogHeader>
                <TabsContent value="login">
                   <AuthForm type="login" onAuthSuccess={() => setIsAuthModalOpen(false)} />
                </TabsContent>
                <TabsContent value="register">
                    <AuthForm type="register" onAuthSuccess={() => setIsAuthModalOpen(false)} />
                </TabsContent>
            </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}


function AuthForm({ type, onAuthSuccess }: { type: 'login' | 'register', onAuthSuccess: (user: FirebaseAuthUser) => void }) {
    const context = useContext(AppContext);
    const { toast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+998');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!context) return null;
    const { translations: t, login, register } = context;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let user;
            if (type === 'login') {
                user = await login(email, password, 'passenger');
                toast({ title: t.loginSuccessTitle });
            } else {
                 if (!name || !email || password.length < 6 || phone.replace(/\D/g, '').length !== 12) {
                    toast({ title: t.validationErrorTitle, description: t.validationErrorDescRegister, variant: "destructive" });
                    setIsSubmitting(false);
                    return;
                }
                user = await register(email, password, name, 'passenger', phone);
                toast({ title: t.registrationSuccessTitle });
            }
            onAuthSuccess(user);
        } catch (error) {
            let errorMessage = t.unknownError;
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
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
            toast({ title: type === 'login' ? t.loginFailedTitle : t.registrationFailedTitle, description: errorMessage, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'register' && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor={`${type}-name`}>{t.fullName}</Label>
                        <Input id={`${type}-name`} value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${type}-phone`}>{t.yourPhone}</Label>
                        <Input id={`${type}-phone`} type="tel" value={phone} onChange={handlePhoneChange} required />
                    </div>
                </>
            )}
            <div className="space-y-2">
                <Label htmlFor={`${type}-email`}>{t.email}</Label>
                <Input id={`${type}-email`} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`${type}-password`}>{t.password}</Label>
                <Input id={`${type}-password`} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : (type === 'login' ? t.login : t.register)}
            </Button>
        </form>
    );
}
