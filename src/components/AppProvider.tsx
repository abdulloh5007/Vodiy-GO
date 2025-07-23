
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations, User, DriverApplicationData } from '@/lib/types';
import { initialTranslations } from '@/lib/i18n';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, User as FirebaseAuthUser } from "firebase/auth";
import { ImageViewer } from './ImageViewer';

const imageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to Data URL.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>(initialTranslations.en);
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // Get saved language from local storage
    const savedLang = localStorage.getItem('vodiygo-lang') as Language;
    if (savedLang && ['en', 'ru', 'uz'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
        const i18n = await import(`@/lib/locales/${language}.json`);
        setTranslations(i18n.default);
        localStorage.setItem('vodiygo-lang', language);
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
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const ridesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Ride))
        .filter(ride => {
            if (ride.createdAt) {
                const rideDate = ride.createdAt.toDate().getTime();
                return (now - rideDate) < oneDay;
            }
            return true; // keep rides without timestamp for now
        });
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
            // This case is for users that might not have a user doc yet.
            // Let's create a passenger one by default.
            const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'passenger' };
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
  

  const addDriverApplication = async (driverData: DriverApplicationData) => {
    if (!user) {
        throw new Error("User must be logged in to submit an application.");
    }
    if (!driverData.carPhotoFile) {
        throw new Error("Car photo is required.");
    }

    const driverDocRef = doc(db, "drivers", user.uid);
    const driverDocSnap = await getDoc(driverDocRef);

    if (driverDocSnap.exists()) {
      throw new Error("Application already exists for this user.");
    }

    // 1. Convert image to Data URL
    const carPhotoUrl = await imageToDataUrl(driverData.carPhotoFile);

    // 2. Prepare data for Firestore
    const { carPhotoFile, ...driverInfo } = driverData;
    
    await setDoc(driverDocRef, {
        id: user.uid,
        ...driverInfo,
        carPhotoUrl,
        status: 'pending', // Application is pending review
    });
  };

  const updateDriverStatus = async (driverId: string, status: 'verified' | 'rejected') => {
    const driverDoc = doc(db, "drivers", driverId);
    await setDoc(driverDoc, { status }, { merge: true });
  };
  
  const updateRideStatus = async (rideId: string, status: 'approved' | 'rejected') => {
    const rideDoc = doc(db, "rides", rideId);
    await updateDoc(rideDoc, { status });
  }

  const updateOrderStatus = async (orderId: string, status: 'accepted' | 'rejected') => {
      const orderDoc = doc(db, "orders", orderId);
      await updateDoc(orderDoc, { status });
  }

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status'>) => {
    if (!user) throw new Error("User not logged in");
    
    const newRideRef = doc(collection(db, "rides"))
    await setDoc(newRideRef, {
      ...rideData,
      id: newRideRef.id,
      createdAt: serverTimestamp(),
      status: 'pending', // All new rides are pending
    });
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'passengerId'> & { passengerId: string }) => {
    const newOrderRef = doc(collection(db, "orders"))
    await setDoc(newOrderRef, {
      ...orderData,
      id: newOrderRef.id,
      status: 'new',
      createdAt: serverTimestamp(),
    });
  };

  const login = async (email: string, password: string, role?: 'admin' | 'driver' | 'passenger'):Promise<void> => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
  
      if (role) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as User;
              if (userData.role !== role) {
                  await signOut(auth);
                  throw new Error('auth/unauthorized-role');
              }
          } else {
              await signOut(auth);
              throw new Error('auth/no-user-record');
          }
      }
  };
  
  const register = async (email: string, password: string, name: string, role: 'passenger' | 'driver'): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, name, role };
    await setDoc(userDocRef, newUser);

    // DO NOT create a driver document here. It will be created upon application submission.
  };
  
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, translations,
      user,
      drivers, rides, orders, 
      addDriverApplication, updateDriverStatus, updateOrderStatus, updateRideStatus,
      addRide, addOrder,
      login, register, logout,
      loading,
      selectedImage, setSelectedImage
    }}>
      {children}
      <ImageViewer imageUrl={selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)} />
    </AppContext.Provider>
  );
}
