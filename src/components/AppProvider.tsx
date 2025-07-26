
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { Driver, Ride, Order, Language, Translations, User, DriverApplicationData, PromoCode, Message } from '@/lib/types';
import { initialTranslations } from '@/lib/i18n';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, where, getDocs, deleteDoc, updateDoc, runTransaction, arrayUnion } from "firebase/firestore";
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
  const [messages, setMessages] = useState<Message[]>([]);
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
    const unsubscribeDrivers = onSnapshot(query(collection(db, "drivers"), orderBy("rating", "desc")), (snapshot) => {
      const driversData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
      setDrivers(driversData);
    });

    const ridesQuery = query(collection(db, "rides"), orderBy("createdAt", "desc"));
    const unsubscribeRides = onSnapshot(ridesQuery, (snapshot) => {
      const now = Date.now();
      const ridesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Ride))
        .filter(ride => {
            if (ride.status === 'pending' || ride.status === 'rejected') {
                return true;
            }
            if (ride.status === 'approved' && ride.approvedAt) {
                const rideApprovedDate = ride.approvedAt.toDate().getTime();
                const durationHours = ride.promoCode ? 24 : 12;
                const durationMillis = durationHours * 60 * 60 * 1000;
                return (now - rideApprovedDate) < durationMillis;
            }
            return false;
        });

      setRides(ridesData);
    });
    
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

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
            const userData = { uid: firebaseUser.uid, ...userDocSnap.data() } as User;
            setUser(userData);
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
  
  // Effect to subscribe to messages for the current user
  useEffect(() => {
    if (user?.uid) {
        const messagesQuery = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'desc'));
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(messagesData);
        });
        return () => unsubscribeMessages();
    } else {
        setMessages([]);
    }
  }, [user]);

  const addMessage = async (userId: string, type: Message['type'], titleKey: string, bodyKey: string, bodyParams?: Record<string, string>) => {
    const messageRef = doc(collection(db, 'users', userId, 'messages'));
    await setDoc(messageRef, {
        id: messageRef.id,
        type,
        titleKey,
        bodyKey,
        ...(bodyParams && { bodyParams }),
        createdAt: serverTimestamp(),
        isRead: false
    });
  }

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

    const carPhotoUrl = await imageToDataUrl(driverData.carPhotoFile);
    const { carPhotoFile, ...driverInfo } = driverData;
    
    await setDoc(driverDocRef, {
        id: user.uid,
        ...driverInfo,
        phone,
        carPhotoUrl,
        status: 'pending',
        rating: 0,
        reviewCount: 0
    });
    
    await addMessage(user.uid, 'REGISTRATION_PENDING', 'message_reg_pending_title', 'message_reg_pending_body');
  };

  const updateDriverStatus = async (driverId: string, status: 'verified' | 'rejected' | 'blocked', reason?: string) => {
    const driverDoc = doc(db, "drivers", driverId);
    
    const updateData: any = { status };
    if (reason) {
        updateData.rejectionReason = reason;
    } else if (status === 'verified') {
        // Clear rejection reason on re-verification/unblocking
        updateData.rejectionReason = '';
    }

    await setDoc(driverDoc, updateData, { merge: true });

    if (status === 'verified') {
        await addMessage(driverId, 'REGISTRATION_APPROVED', 'message_reg_approved_title', 'message_reg_approved_body');
    } else if (status === 'rejected') {
        await addMessage(driverId, 'REGISTRATION_REJECTED', 'message_reg_rejected_title', 'message_reg_rejected_body', { reason: reason || translations.reason_not_specified || "Not specified" });
    } else if (status === 'blocked') {
        await addMessage(driverId, 'REGISTRATION_BLOCKED', 'message_reg_blocked_title', 'message_reg_blocked_body', { reason: reason || translations.reason_not_specified || "Not specified" });
    }
  };
  
  const updateRideStatus = async (rideId: string, status: 'approved' | 'rejected', reason?: string) => {
    const rideDocRef = doc(db, "rides", rideId);
    const rideDocSnap = await getDoc(rideDocRef);
    if (!rideDocSnap.exists()) return;
    const rideData = rideDocSnap.data() as Ride;

    const updatePayload: any = { 
        status,
        ...(reason && { rejectionReason: reason })
    };

    if (status === 'approved') {
        updatePayload.approvedAt = serverTimestamp();
    }
    
    await updateDoc(rideDocRef, updatePayload);

    if (status === 'approved') {
        await addMessage(rideData.driverId, 'RIDE_APPROVED', 'message_ride_approved_title', 'message_ride_approved_body', { from: rideData.from, to: rideData.to });
    } else if (status === 'rejected') {
        await addMessage(rideData.driverId, 'RIDE_REJECTED', 'message_ride_rejected_title', 'message_ride_rejected_body', { from: rideData.from, to: rideData.to, reason: reason || translations.reason_not_specified || "Not specified" });
    }
  }

  const deleteDriver = async (driverId: string) => {
    const driverDoc = doc(db, "drivers", driverId);
    await deleteDoc(driverDoc);
    const userDoc = doc(db, "users", driverId);
    await deleteDoc(userDoc);
  }

  const updateOrderStatus = async (orderId: string, status: 'accepted' | 'rejected') => {
      const orderDoc = doc(db, "orders", orderId);
      await updateDoc(orderDoc, { status });
  }

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status' | 'approvedAt'>) => {
    if (!user) throw new Error("User not logged in");
    
    const ridePayload = {
      ...rideData,
      id: '',
      createdAt: serverTimestamp(),
      status: 'pending' as const,
      approvedAt: null
    };

    if (rideData.promoCode) {
        // Run as transaction
        const promoQuery = query(collection(db, 'promocodes'), where('code', '==', rideData.promoCode));
        const promoSnapshot = await getDocs(promoQuery);

        if (promoSnapshot.empty) throw new Error("promocode/not-found");
        
        const promoDocRef = promoSnapshot.docs[0].ref;

        await runTransaction(db, async (transaction) => {
            const promoDoc = await transaction.get(promoDocRef);
            if (!promoDoc.exists()) {
                throw new Error("promocode/not-found");
            }
            const promoData = promoDoc.data() as PromoCode;
            
            // Re-check conditions inside transaction for safety
            if (promoData.status !== 'active' || promoData.expiresAt.toDate() < new Date() || (promoData.usedBy && promoData.usedBy.includes(user.uid))) {
                throw new Error("promocode/invalid");
            }

            const newUsageCount = (promoData.usageCount || 0) + 1;
            transaction.update(promoDocRef, { 
                usageCount: newUsageCount,
                usedBy: arrayUnion(user.uid),
                ...(newUsageCount >= promoData.limit && { status: 'depleted' })
            });

            const newRideRef = doc(collection(db, "rides"));
            ridePayload.id = newRideRef.id;
            transaction.set(newRideRef, ridePayload);
        });

    } else {
        // Simple write without transaction
        const newRideRef = doc(collection(db, "rides"))
        ridePayload.id = newRideRef.id;
        await setDoc(newRideRef, ridePayload);
    }

    await addMessage(user.uid, 'RIDE_CREATED', 'message_ride_created_title', 'message_ride_created_body', { from: rideData.from, to: rideData.to });
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
        usedBy: [],
        status: 'active',
        type: 'EXTEND_12H',
        createdAt: serverTimestamp(),
    });
  }

  const checkPromoCode = async (code: string, driverId: string): Promise<PromoCode> => {
    const promoQuery = query(collection(db, 'promocodes'), where('code', '==', code));
    const promoSnapshot = await getDocs(promoQuery);

    if (promoSnapshot.empty) {
        throw new Error("promocode/not-found");
    }

    const promoDoc = promoSnapshot.docs[0];
    const promoData = { id: promoDoc.id, ...promoDoc.data() } as PromoCode;

    if (promoData.status !== 'active') {
        throw new Error("promocode/inactive");
    }
    if (promoData.expiresAt.toDate() < new Date()) {
        throw new Error("promocode/expired");
    }
    if (promoData.usageCount >= promoData.limit) {
        throw new Error("promocode/limit-reached");
    }
    if (promoData.usedBy && promoData.usedBy.includes(driverId)) {
        throw new Error("promocode/already-used");
    }

    return promoData;
  }

  const login = async (email: string, password: string, role?: 'admin' | 'driver' | 'passenger'):Promise<FirebaseAuthUser> => {
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
      return firebaseUser;
  };
  
  const register = async (email: string, password: string, name: string, role: 'passenger' | 'driver', phone?: string): Promise<FirebaseAuthUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email, name, role, ...(phone && { phone }) };
    await setDoc(userDocRef, newUser);

    return firebaseUser;
  };
  
  const logout = async () => {
    const userRole = user?.role;
    await signOut(auth);
    setUser(null);
    if (userRole === 'driver') {
        window.location.href = '/driver/login';
    } else {
        window.location.href = '/';
    }
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, translations,
      user,
      users,
      drivers, rides, orders, 
      promoCodes, createPromoCode, checkPromoCode,
      messages,
      addDriverApplication, updateDriverStatus, deleteDriver, updateOrderStatus, updateRideStatus,
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
