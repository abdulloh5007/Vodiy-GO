'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations } from '@/lib/types';
import { translations } from '@/lib/i18n';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseAuthUser } from "firebase/auth";


interface User {
  uid: string;
  email: string | null;
  role: 'driver' | 'admin';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribeDrivers = onSnapshot(collection(db, "drivers"), (snapshot) => {
      const driversData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
      setDrivers(driversData);
    });

    const ridesQuery = query(collection(db, "rides"), orderBy("createdAt", "desc"));
    const unsubscribeRides = onSnapshot(ridesQuery, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
      setRides(ridesData);
    });
    
    // Assuming orders are fetched for a specific driver or admin.
    // This will need to be adjusted based on user role.
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Here you might want to fetch user role from Firestore
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'admin' }); // Assuming all logged in users are admins for now
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeDrivers();
      unsubscribeRides();
      unsubscribeOrders();
      unsubscribeAuth();
    };
  }, []);

  const addDriverApplication = async (driverData: Omit<Driver, 'id' | 'status'>) => {
    try {
      await addDoc(collection(db, "drivers"), {
        ...driverData,
        status: 'pending',
      });
    } catch (error) {
      console.error("Error adding driver application: ", error);
    }
  };

  const updateDriverStatus = async (driverId: string, status: 'verified' | 'rejected') => {
    const driverDoc = doc(db, "drivers", driverId);
    await updateDoc(driverDoc, { status });
  };

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, "rides"), {
      ...rideData,
      createdAt: new Date().toISOString(),
    });
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'status'>) => {
    await addDoc(collection(db, "orders"), {
      ...orderData,
      status: 'new',
    });
  };

  const loginAsAdmin = async (email: string, password: string):Promise<void> => {
     try {
        await signInWithEmailAndPassword(auth, email, password);
     } catch (error) {
        console.error("Admin login failed:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred during login.');
     }
  };
  
  const logout = async () => {
    await signOut(auth);
  };


  return (
    <AppContext.Provider value={{ 
      language, setLanguage, translations,
      user,
      drivers, rides, orders, 
      addDriverApplication, updateDriverStatus,
      addRide, addOrder,
      loginAsAdmin, logout,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
}
