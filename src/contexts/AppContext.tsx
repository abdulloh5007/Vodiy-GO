'use client';

import React from 'react';
import { Driver, Ride, Order, Language, Translations } from '@/lib/types';
import { translations } from '@/lib/i18n';

interface User {
  id: number;
  name: string;
  role: 'driver' | 'admin';
}

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: { [key in Language]: Translations };
  user: User | null;
  drivers: Driver[];
  rides: Ride[];
  orders: Order[];
  addDriverApplication: (driver: Omit<Driver, 'id' | 'status'>) => void;
  updateDriverStatus: (driverId: number, status: 'verified' | 'rejected') => void;
  addRide: (ride: Omit<Ride, 'id' | 'createdAt'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'status'>) => void;
  loginAsDriver: (driverId: number) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);
