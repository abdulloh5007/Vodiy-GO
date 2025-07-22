
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations, User } from '@/lib/types';
import { initialTranslations } from '@/lib/i18n';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, User as FirebaseAuthUser } from "firebase/auth";
import { ImageViewer } from './ImageViewer';

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
  
  const uploadCarPhoto = async (userId: string, file: File): Promise<string> => {
      const storage = getStorage();
      const storageRef = ref(storage, `car-photos/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
  }

  const addDriverApplication = async (driverData: Omit<Driver, 'id' | 'status' | 'carPhotoUrl'> & { carPhotoFile: File | null, email: string, password?: string }) => {
    if (!driverData.email || !driverData.password) {
        throw new Error("Email and password are required for registration.");
    }

    // 1. Create user in Firebase Auth first
    const userCredential = await createUserWithEmailAndPassword(auth, driverData.email, driverData.password);
    const firebaseUser = userCredential.user;
    
    // 2. Upload car photo if it exists
    let carPhotoUrl = '';
    if (driverData.carPhotoFile) {
        carPhotoUrl = await uploadCarPhoto(firebaseUser.uid, driverData.carPhotoFile);
    }

    // 3. Prepare data for Firestore batch write
    const { carPhotoFile, email, password, ...driverInfo } = driverData;
    
    const batch = writeBatch(db);

    // User document with 'driver' role
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'driver' };
    batch.set(userDocRef, newUser);

    // Driver document with 'pending' status
    const driverDocRef = doc(db, "drivers", firebaseUser.uid);
    batch.set(driverDocRef, {
        ...driverInfo,
        carPhotoUrl,
        status: 'pending',
    });
    
    // 4. Commit the batch
    await batch.commit();
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
    
    await setDoc(doc(collection(db, "rides")), {
      ...rideData,
      createdAt: serverTimestamp(),
      status: 'pending', // All new rides are pending
    });
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'passengerId'> & { passengerId: string }) => {
    await setDoc(doc(collection(db, "orders")), {
      ...orderData,
      status: 'new',
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
  
  const register = async (email: string, password: string, role: 'passenger'): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, role };
    await setDoc(userDocRef, newUser);
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
