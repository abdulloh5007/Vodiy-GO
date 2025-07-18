'use client';

import { useState, useMemo, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/AppContext';
import { RideCard } from '@/components/RideCard';
import { Ride } from '@/lib/types';
import { MapPin, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function HomeSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
           <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full md:w-auto" />
          </div>
        </CardContent>
      </Card>
      <div>
        <Skeleton className="h-9 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
              <CardFooter className="p-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Home must be used within an AppProvider');
  }
  const { rides, drivers, translations, language, loading } = context;

  const [from, setFrom] = useState('all');
  const [to, setTo] = useState('all');

  const t = translations;

  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    rides.forEach(ride => {
      locations.add(ride.from);
      locations.add(ride.to);
    });
    return Array.from(locations);
  }, [rides]);

  const filteredRides = useMemo(() => {
    return rides.filter(ride => {
      const driver = drivers.find(d => d.id === ride.driverId && d.status === 'verified');
      if (!driver) return false;
      const fromMatch = from === 'all' || ride.from === from;
      const toMatch = to === 'all' || ride.to === to;
      return fromMatch && toMatch;
    });
  }, [rides, drivers, from, to]);

  const handleSearch = () => {
    // This function is kept for semantic purposes,
    // as filtering is done live via useMemo.
    // In a real app, this might trigger an API call.
    console.log(`Searching from: ${from}, to: ${to}`);
  };
  
  if (loading || !t.home) {
      return <HomeSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <MapPin className="text-primary" /> {t.findRide}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">{t.from}</label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectOrigin} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allLocations}</SelectItem>
                  {availableLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.to}</label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectDestination} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allLocations}</SelectItem>
                  {availableLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="w-full md:w-auto self-end bg-accent hover:bg-accent/80 text-accent-foreground">
              {t.search}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-3xl font-headline mb-6">{t.availableRides}</h2>
        {filteredRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.map(ride => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <p className="text-muted-foreground">{t.noRidesFound}</p>
          </div>
        )}
      </div>
    </div>
  );
}
