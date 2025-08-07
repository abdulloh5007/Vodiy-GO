

'use client';

import React from 'react';
import { Driver, Ride, Order, Language, Translations, User, DriverApplicationData, PromoCode, Message, UserRegistrationRequest } from '@/lib/types';
import { User as FirebaseAuthUser } from 'firebase/auth';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  user: User | null;
  users: User[];
  updateUserStatus: (userId: string, status: 'active' | 'blocked', reason?: string) => Promise<void>;
  drivers: Driver[];
  rides: Ride[];
  orders: Order[];
  promoCodes: PromoCode[];
  messages: Message[];
  userRegistrationRequests: UserRegistrationRequest[];
  deleteUserRegistrationRequest: (id: string) => Promise<void>;
  createPromoCode: (limit: number, validityHours: number) => Promise<void>;
  checkPromoCode: (code: string, driverId: string) => Promise<PromoCode>;
  addDriverApplication: (driver: DriverApplicationData) => Promise<void>;
  updateDriverStatus: (driverId: string, status: 'verified' | 'rejected' | 'blocked', reason?: string) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  updateRideStatus: (rideId: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
  deleteRide: (rideId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: 'accepted' | 'rejected') => void;
  updateRideSeats: (rideId: string, newSeatCount: number) => Promise<void>;
  addRide: (ride: Omit<Ride, 'id' | 'createdAt' | 'status' | 'approvedAt' | 'availableSeats'>) => void;
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  login: (email: string, password: string, role?: 'admin' | 'driver' | 'passenger') => Promise<FirebaseAuthUser>;
  loginWithPhone: (phone: string, password: string, role?: 'admin' | 'driver' | 'passenger') => Promise<FirebaseAuthUser>;
  requestUserRegistration: (name: string, phone: string, password?: string) => Promise<void>;
  verifyUser: (phone: string, code: string) => Promise<FirebaseAuthUser>;
  register: (email: string, password: string, name: string, role: 'driver' | 'passenger', phone: string) => Promise<FirebaseAuthUser>;
  registerDriver: (phone: string, password: string) => Promise<FirebaseAuthUser>;
  logout: () => void;
  loading: boolean;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);
