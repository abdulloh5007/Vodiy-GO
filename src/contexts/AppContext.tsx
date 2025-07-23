
'use client';

import React from 'react';
import { Driver, Ride, Order, Language, Translations, User, DriverApplicationData } from '@/lib/types';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  user: User | null;
  users: User[];
  drivers: Driver[];
  rides: Ride[];
  orders: Order[];
  addDriverApplication: (driver: DriverApplicationData) => Promise<void>;
  updateDriverStatus: (driverId: string, status: 'verified' | 'rejected') => void;
  updateRideStatus: (rideId: string, status: 'approved' | 'rejected') => void;
  updateOrderStatus: (orderId: string, status: 'accepted' | 'rejected') => void;
  addRide: (ride: Omit<Ride, 'id' | 'createdAt' | 'status' | 'approvedAt'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  login: (email: string, password: string, role?: 'admin' | 'driver' | 'passenger') => Promise<void>;
  register: (email: string, password: string, name: string, role: 'passenger' | 'driver', phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);
