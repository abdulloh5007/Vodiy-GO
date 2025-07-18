'use client';

import React from 'react';
import { Driver, Ride, Order, Language, Translations, User } from '@/lib/types';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  user: User | null;
  drivers: Driver[];
  rides: Ride[];
  orders: Order[];
  addDriverApplication: (driver: Omit<Driver, 'id' | 'status'>) => Promise<void>;
  updateDriverStatus: (driverId: string, status: 'verified' | 'rejected') => void;
  addRide: (ride: Omit<Ride, 'id' | 'createdAt'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'status'>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);
