
'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/AppContext';
import { Ride, User } from '@/lib/types';
import { User as UserIcon, Car, Tag, ArrowRight, Clock, LogIn, ShieldCheck, Armchair } from 'lucide-react';
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

interface RideCardProps {
  ride: Ride;
  onImageClick: (url: string) => void;
}

export function RideCard({ ride, onImageClick }: RideCardProps) {
  const context = useContext(AppContext);
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [authAction, setAuthAction] = useState<'login'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+998');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientPhone(formatted);
  };
  
  const handleAuthAndBook = async (e: React.FormEvent) => {
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
        await login(email, password, 'passenger');
        toast({ title: t.loginSuccessTitle });
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
        }
        toast({
            title: t.loginFailedTitle,
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleBooking = () => {
    if (!user) {
        setIsBooking(true);
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
    
    addOrder({
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
  
   useEffect(() => {
    if (user && isBooking && user.role === 'passenger') {
        addOrder({
            rideId: ride.id,
            passengerId: user.uid,
            clientName: user.name || clientName, 
            clientPhone: user.phone || clientPhone,
        });
         toast({
            title: t.bookingRequestSent,
            description: t.bookingRequestSent_desc,
        });
        setIsBooking(false);
        setClientName('');
        setClientPhone('+998');
        setEmail('');
        setPassword('');
        router.push('/my-orders');
    }
  }, [user, isBooking, addOrder, clientName, clientPhone, ride.id, router, t]);


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
      
      <Dialog open={isBooking} onOpenChange={setIsBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.bookYourRide}</DialogTitle>
            <DialogDescription>
              {t.loginToBook}
            </DialogDescription>
          </DialogHeader>
            <form onSubmit={handleAuthAndBook}>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email}</Label>
                    <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="login-password">{t.password}</Label>
                    <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>{t.loginAndBook}</Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
