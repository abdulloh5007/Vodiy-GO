'use client';

import { useState, useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"

export default function RegisterDriverPage() {
  const context = useContext(AppContext);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [carPhotoUrl, setCarPhotoUrl] = useState('');

  if (!context) {
    throw new Error('RegisterDriverPage must be used within an AppProvider');
  }

  const { addDriverApplication, language, translations } = context;
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !carModel || !carNumber || !carPhotoUrl) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }
    
    addDriverApplication({ name, phone, carModel, carNumber, carPhotoUrl });

    toast({
        title: t.applicationSubmitted,
        description: t.weWillReviewYourApplication,
    });

    // Reset form
    setName('');
    setPhone('');
    setCarModel('');
    setCarNumber('');
    setCarPhotoUrl('');
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.driverRegistration}</CardTitle>
          <CardDescription>{t.fillTheForm}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.fullName}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.yourPhone}</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carModel">{t.carModel}</Label>
              <Input id="carModel" value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="e.g., Chevrolet Cobalt" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carNumber">{t.carNumber}</Label>
              <Input id="carNumber" value={carNumber} onChange={e => setCarNumber(e.target.value)} placeholder="e.g., 01 A 123 BC" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carPhotoUrl">{t.carPhotoUrl}</Label>
              <Input id="carPhotoUrl" type="url" value={carPhotoUrl} onChange={e => setCarPhotoUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" required />
            </div>
            <Button type="submit" className="w-full">{t.submitApplication}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
