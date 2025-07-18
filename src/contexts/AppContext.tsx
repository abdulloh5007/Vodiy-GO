'use client';

import React from 'react';
import { Driver, Ride, Order, Language, Translations } from '@/lib/types';

interface User {
  uid: string;
  email: string | null;
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
  updateDriverStatus: (driverId: string, status: 'verified' | 'rejected') => void;
  addRide: (ride: Omit<Ride, 'id' | 'createdAt'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'status'>) => void;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AppContext = React.createContext<AppContextType | null>(null);
