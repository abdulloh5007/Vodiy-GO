
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations, User, DriverApplicationData, PromoCode } from '@/lib/types';
import { initialTranslations } from '@/lib/i18n';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, where, getDocs, deleteDoc, updateDoc, runTransaction } from "firebase/firestore";
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
  const [users, setUsers] = useState<User[]>([]); // To store all users for admin
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
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
      const ridesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Ride))
        .filter(ride => {
            if (ride.approvedAt) {
                const rideApprovedDate = ride.approvedAt.toDate().getTime();
                const duration = ride.promoCode ? 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
                return (now - rideApprovedDate) < duration;
            }
            // Keep pending rides or rides without approvedAt timestamp for now
            return ride.status === 'pending';
        });
      setRides(ridesData);
    });
    
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

    // For admin to view all users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => doc.data() as User);
        setUsers(usersData);
    });

     const unsubscribePromoCodes = onSnapshot(query(collection(db, "promocodes"), orderBy("createdAt", "desc")), (snapshot) => {
      const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
      setPromoCodes(codesData);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as User);
        } else {
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
      unsubscribeUsers();
      unsubscribePromoCodes();
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
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const phone = userDoc.data()?.phone || '';

    // 1. Convert image to Data URL
    const carPhotoUrl = await imageToDataUrl(driverData.carPhotoFile);

    // 2. Prepare data for Firestore
    const { carPhotoFile, ...driverInfo } = driverData;
    
    await setDoc(driverDocRef, {
        id: user.uid,
        ...driverInfo,
        phone,
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
    await updateDoc(rideDoc, { 
        status,
        ...(status === 'approved' && { approvedAt: serverTimestamp() })
    });
  }

  const updateOrderStatus = async (orderId: string, status: 'accepted' | 'rejected') => {
      const orderDoc = doc(db, "orders", orderId);
      await updateDoc(orderDoc, { status });
  }

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status' | 'approvedAt'>) => {
    if (!user) throw new Error("User not logged in");
    
    if (rideData.promoCode) {
        try {
            await runTransaction(db, async (transaction) => {
                const promoQuery = query(collection(db, 'promocodes'), where('code', '==', rideData.promoCode));
                const promoSnapshot = await getDocs(promoQuery);

                if (promoSnapshot.empty) {
                    throw new Error("promocode/not-found");
                }

                const promoDoc = promoSnapshot.docs[0];
                const promoData = promoDoc.data() as PromoCode;

                if (promoData.status !== 'active') {
                    throw new Error("promocode/inactive");
                }
                if (promoData.expiresAt.toDate() < new Date()) {
                    transaction.update(promoDoc.ref, { status: 'expired' });
                    throw new Error("promocode/expired");
                }
                if (promoData.usageCount >= promoData.limit) {
                     transaction.update(promoDoc.ref, { status: 'depleted' });
                    throw new Error("promocode/limit-reached");
                }
                
                const newUsageCount = promoData.usageCount + 1;
                transaction.update(promoDoc.ref, { 
                    usageCount: newUsageCount,
                    ...(newUsageCount >= promoData.limit && { status: 'depleted' })
                });

                const newRideRef = doc(collection(db, "rides"));
                transaction.set(newRideRef, {
                    ...rideData,
                    id: newRideRef.id,
                    createdAt: serverTimestamp(),
                    status: 'pending',
                    approvedAt: null
                });
            });
        } catch (error) {
            console.error("Transaction failed: ", error);
            throw error; // Re-throw the error to be caught by the caller
        }
    } else {
        const newRideRef = doc(collection(db, "rides"))
        await setDoc(newRideRef, {
          ...rideData,
          id: newRideRef.id,
          createdAt: serverTimestamp(),
          status: 'pending', 
          approvedAt: null
        });
    }
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
  
  const createPromoCode = async (limit: number, validityHours: number) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCodeRef = doc(collection(db, "promocodes"));
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + validityHours);

    await setDoc(newCodeRef, {
        id: newCodeRef.id,
        code,
        limit,
        expiresAt,
        usageCount: 0,
        status: 'active',
        type: 'EXTEND_12H',
        createdAt: serverTimestamp(),
    });
  }

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
              // This case should not happen for login, but as a safeguard:
              await signOut(auth);
              throw new Error('auth/no-user-record');
          }
      }
  };
  
  const register = async (email: string, password: string, name: string, role: 'passenger' | 'driver', phone?: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, name, role, ...(phone && { phone }) };
    await setDoc(userDocRef, newUser);

    // DO NOT create a driver document here. It will be created upon application submission.
  };
  
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    window.location.href = '/';
  };
  
  const saveFcmToken = async (uid: string, token: string) => {
    try {
        const tokenRef = doc(db, 'fcmTokens', token);
        await setDoc(tokenRef, { uid, token, createdAt: serverTimestamp() }, { merge: true });
    } catch (error) {
        console.error("Error saving FCM token: ", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, translations,
      user,
      users,
      drivers, rides, orders, 
      promoCodes, createPromoCode,
      addDriverApplication, updateDriverStatus, updateOrderStatus, updateRideStatus,
      addRide, addOrder,
      login, register, logout,
      loading,
      selectedImage, setSelectedImage,
      saveFcmToken
    }}>
      {children}
      <ImageViewer imageUrl={selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)} />
    </AppContext.Provider>
  );
}
