'use client';

import { useState, useContext, useMemo } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const locations = ["Tashkent", "Andijan", "Fergana", "Samarkand", "Bukhara"];

function CreateRideSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function CreateRidePage() {
  const context = useContext(AppContext);
  const { toast } = useToast();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [price, setPrice] = useState('');
  const [info, setInfo] = useState('');
  const [time, setTime] = useState('');
  
  if (!context) {
    throw new Error('CreateRidePage must be used within an AppProvider');
  }

  const { user, addRide, translations, drivers, loading } = context;
  const t = translations;

  const isVerifiedDriver = user && drivers.some(d => d.id === user.uid && d.status === 'verified');
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s/g, '');
    if (!isNaN(Number(rawValue))) {
      const formattedValue = new Intl.NumberFormat('fr-FR').format(Number(rawValue));
      setPrice(formattedValue);
    }
  };

  const fromLocations = useMemo(() => locations.filter(loc => loc !== to), [to]);
  const toLocations = useMemo(() => locations.filter(loc => loc !== from), [from]);

  if (loading || !t.home) {
      return <CreateRideSkeleton />;
  }

  if (!isVerifiedDriver) {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert className="text-destructive h-8 w-8"/>{t.accessDenied}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t.youMustBeVerified}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = Number(price.replace(/\s/g, ''));

    if (!from || !to || !price || from === to || isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields correctly. Origin and destination cannot be the same, and price must be a valid number.",
        variant: "destructive",
      });
      return;
    }
    
    if (user) {
        await addRide({
          driverId: user.uid,
          from,
          to,
          price: priceValue,
          info,
          time,
        });
        
        toast({
            title: t.ridePublished,
            description: t.yourRideIsNowLive,
        });

        setFrom('');
        setTo('');
        setPrice('');
        setInfo('');
        setTime('');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.publishNewRide}</CardTitle>
          <CardDescription>{t.fillTheFormToPublish}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="from">{t.from}</Label>
                    <Select value={from} onValueChange={setFrom}>
                        <SelectTrigger id="from">
                            <SelectValue placeholder={t.selectOrigin} />
                        </SelectTrigger>
                        <SelectContent>
                            {fromLocations.map(loc => <SelectItem key={`from-${loc}`} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="to">{t.to}</Label>
                    <Select value={to} onValueChange={setTo}>
                        <SelectTrigger id="to">
                            <SelectValue placeholder={t.selectDestination} />
                        </SelectTrigger>
                        <SelectContent>
                            {toLocations.map(loc => <SelectItem key={`to-${loc}`} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t.price}</Label>
                  <Input id="price" value={price} onChange={handlePriceChange} placeholder="100 000" required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="time">{t.departureTimeOptional}</Label>
                  <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="info">{t.additionalInfo}</Label>
              <Textarea id="info" value={info} onChange={e => setInfo(e.target.value)} placeholder={t.additionalInfoPlaceholder} />
            </div>
            <Button type="submit" className="w-full">{t.publishRide}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
