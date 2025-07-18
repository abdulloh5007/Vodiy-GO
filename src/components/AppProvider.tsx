'use client';

import { useState, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations } from '@/lib/types';
import { translations } from '@/lib/i18n';

const initialDrivers: Driver[] = [
  { id: 1, name: 'Azizbek Anvarov', phone: '+998901234567', carModel: 'Chevrolet Cobalt', carNumber: '01 A 123 BC', carPhotoUrl: 'https://placehold.co/600x400.png', status: 'verified' },
  { id: 2, name: 'Sardor Komilov', phone: '+998902345678', carModel: 'Chevrolet Lacetti', carNumber: '10 B 456 CD', carPhotoUrl: 'https://placehold.co/600x400.png', status: 'pending' },
  { id: 3, name: 'Alisher Usmanov', phone: '+998903456789', carModel: 'Daewoo Nexia 3', carNumber: '30 C 789 DE', carPhotoUrl: 'https://placehold.co/600x400.png', status: 'verified' },
];

const initialRides: Ride[] = [
  { id: 1, driverId: 1, from: 'Tashkent', to: 'Andijan', price: 100000, info: 'Pickup from metro Chilonzor.', createdAt: new Date().toISOString() },
  { id: 2, driverId: 3, from: 'Fergana', to: 'Tashkent', price: 90000, info: 'White car, clean interior.', createdAt: new Date().toISOString() },
  { id: 3, driverId: 1, from: 'Andijan', to: 'Tashkent', price: 100000, info: 'Only 2 seats left!', createdAt: new Date().toISOString() },
];

interface User {
  id: number;
  name: string;
  role: 'driver' | 'admin';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [orders, setOrders] = useState<Order[]>([]);

  const addDriverApplication = (driverData: Omit<Driver, 'id' | 'status'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: Date.now(),
      status: 'pending',
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const updateDriverStatus = (driverId: number, status: 'verified' | 'rejected') => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status } : d));
  };

  const addRide = (rideData: Omit<Ride, 'id' | 'createdAt'>) => {
    const newRide: Ride = {
      ...rideData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setRides(prev => [newRide, ...prev]);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      status: 'new',
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const loginAsDriver = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver && driver.status === 'verified') {
      setUser({ id: driver.id, name: driver.name, role: 'driver' });
    } else if (driver) {
      alert('Your application is not verified yet.');
    } else {
      alert('Driver not found');
    }
  };

  const loginAsAdmin = () => {
    setUser({ id: 999, name: 'Admin', role: 'admin' });
  };
  
  const logout = () => {
    setUser(null);
  };


  return (
    <AppContext.Provider value={{ 
      language, setLanguage, translations,
      user,
      drivers, rides, orders, 
      addDriverApplication, updateDriverStatus,
      addRide, addOrder,
      loginAsDriver, loginAsAdmin, logout
    }}>
      {children}
    </AppContext.Provider>
  );
}
