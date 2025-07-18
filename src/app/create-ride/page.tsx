'use client';

import { useState, useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert } from 'lucide-react';

const locations = ["Tashkent", "Andijan", "Fergana", "Samarkand", "Bukhara"];

export default function CreateRidePage() {
  const context = useContext(AppContext);
  const { toast } = useToast();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [price, setPrice] = useState('');
  const [info, setInfo] = useState('');
  
  if (!context) {
    throw new Error('CreateRidePage must be used within an AppProvider');
  }

  const { user, addRide, language, translations, drivers } = context;
  const t = translations[language];

  // A logged-in admin is not a driver. This logic checks if the user is a verified driver.
  const isVerifiedDriver = user && drivers.some(d => d.id === user.uid && d.status === 'verified');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !price || from === to) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields correctly. Origin and destination cannot be the same.",
        variant: "destructive",
      });
      return;
    }
    
    if (user) {
        addRide({
          driverId: user.uid,
          from,
          to,
          price: Number(price),
          info,
        });
        
        toast({
            title: t.ridePublished,
            description: t.yourRideIsNowLive,
        });

        setFrom('');
        setTo('');
        setPrice('');
        setInfo('');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.publishNewRide}</CardTitle>
          <CardDescription>{t.fillTheForm}</CardDescription>
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
                            {locations.map(loc => <SelectItem key={`from-${loc}`} value={loc}>{loc}</SelectItem>)}
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
                            {locations.map(loc => <SelectItem key={`to-${loc}`} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="100000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="info">{t.additionalInfo}</Label>
              <Textarea id="info" value={info} onChange={e => setInfo(e.target.value)} placeholder={t.additionalInfo} />
            </div>
            <Button type="submit" className="w-full">{t.publishRide}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
