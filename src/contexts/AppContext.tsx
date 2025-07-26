

'use client';

import React from 'react';
import { Driver, Ride, Order, Language, Translations, User, DriverApplicationData, PromoCode, Message } from '@/lib/types';
import { User as FirebaseAuthUser } from 'firebase/auth';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  user: User | null;
  users: User[];
  drivers: Driver[];
  rides: Ride[];
  orders: Order[];
  promoCodes: PromoCode[];
  messages: Message[];
  createPromoCode: (limit: number, validityHours: number) => Promise<void>;
  checkPromoCode: (code: string, driverId: string) => Promise<PromoCode>;
  addDriverApplication: (driver: DriverApplicationData) => Promise<void>;
  updateDriverStatus: (driverId: string, status: 'verified' | 'rejected' | 'blocked', reason?: string) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  updateRideStatus: (rideId: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: 'accepted' | 'rejected') => void;
  updateRideSeats: (rideId: string, newSeatCount: number) => Promise<void>;
  addRide: (ride: Omit<Ride, 'id' | 'createdAt' | 'status' | 'approvedAt' | 'availableSeats'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  login: (email: string, password: string, role?: 'admin' | 'driver' | 'passenger') => Promise<FirebaseAuthUser>;
  register: (email: string, password: string, name: string, role: 'passenger' | 'driver', phone?: string) => Promise<FirebaseAuthUser>;
  logout: () => void;
  loading: boolean;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);

