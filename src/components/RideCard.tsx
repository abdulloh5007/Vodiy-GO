'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/AppContext';
import { Ride } from '@/lib/types';
import { User, Car, Tag, ArrowRight, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';

interface RideCardProps {
  ride: Ride;
  onImageClick: (url: string) => void;
}

export function RideCard({ ride, onImageClick }: RideCardProps) {
  const context = useContext(AppContext);
  const [isBooking, setIsBooking] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+998');
  const { toast } = useToast();

  if (!context) return null;
  const { drivers, translations, language, addOrder } = context;
  const t = translations;

  const driver = drivers.find(d => d.id === ride.driverId);

  if (!driver) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientPhone(formatted);
  };

  const handleBooking = () => {
    if (!clientName || clientPhone.replace(/\D/g, '').length !== 12) {
        toast({
            title: t.validationErrorTitle,
            description: t.validationErrorDescBooking || "Please fill in your name and a complete phone number.",
            variant: "destructive",
        });
        return;
    }
    addOrder({
        rideId: ride.id,
        clientName,
        clientPhone,
    });
    setIsBooking(false);
    setClientName('');
    setClientPhone('+998');
    toast({
        title: t.bookingSuccessful,
        description: t.yourRideIsBooked,
    });
  };
  
  if (!t.home) {
      return null; // Or a loading skeleton
  }

  const formattedPrice = new Intl.NumberFormat('fr-FR').format(ride.price);

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
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
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
          <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground" onClick={() => setIsBooking(true)}>
            {t.bookNow}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isBooking} onOpenChange={setIsBooking}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t.bookYourRide}</DialogTitle>
                <DialogDescription>
                    {t.confirmBookingFor} {ride.from} &rarr; {ride.to} with {driver.name}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">{t.yourName}</Label>
                    <Input id="name" value={clientName} onChange={(e) => setClientName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">{t.yourPhone}</Label>
                    <Input id="phone" type="tel" value={clientPhone} onChange={handlePhoneChange} className="col-span-3" placeholder="+998 (XX) XXX-XX-XX" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleBooking}>{t.confirmBooking}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
