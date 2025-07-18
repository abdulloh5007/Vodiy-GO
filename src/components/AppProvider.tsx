'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations, User } from '@/lib/types';
import { initialTranslations } from '@/lib/i18n';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, where, getDocs, deleteDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, User as FirebaseAuthUser } from "firebase/auth";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>(initialTranslations.en);
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get saved language from local storage
    const savedLang = localStorage.getItem('roadpilot-lang') as Language;
    if (savedLang && ['en', 'ru', 'uz'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
        const i18n = await import(`@/lib/locales/${language}.json`);
        setTranslations(i18n.default);
        localStorage.setItem('roadpilot-lang', language);
    };
    loadTranslations();
  }, [language]);


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
    
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as User);
        } else {
            // This case might happen for users created before the users collection was standard
            const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'driver' };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
        }
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
    if (!user) throw new Error("User not logged in");
    try {
      const driverDocRef = doc(db, "drivers", user.uid);
      await setDoc(driverDocRef, {
        ...driverData,
        status: 'pending',
      }, { merge: true });
    } catch (error) {
      console.error("Error adding driver application: ", error);
    }
  };

  const updateDriverStatus = async (driverId: string, status: 'verified' | 'rejected') => {
    const driverDoc = doc(db, "drivers", driverId);
    await setDoc(driverDoc, { status }, { merge: true });
  };

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt'>) => {
    if (!user) throw new Error("User not logged in");

    // Delete previous rides by the same driver
    const q = query(collection(db, "rides"), where("driverId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Add the new ride
    await setDoc(doc(collection(db, "rides")), {
      ...rideData,
      createdAt: serverTimestamp(),
    });
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'status'>) => {
    await setDoc(doc(collection(db, "orders")), {
      ...orderData,
      status: 'new',
    });
  };

  const login = async (email: string, password: string):Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const register = async (email: string, password: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const batch = writeBatch(db);

    // Create user document in 'users' collection
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'driver' };
    batch.set(userDocRef, newUser);
    
    // Create an initial empty driver profile
    const driverDocRef = doc(db, "drivers", firebaseUser.uid);
    const newDriverProfile: Partial<Driver> = {
        name: '',
        phone: '',
        carModel: '',
        carNumber: '',
        carPhotoUrl: '',
        status: 'unsubmitted'
    }
    batch.set(driverDocRef, newDriverProfile);
    
    await batch.commit();
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
      login, register, logout,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
}
