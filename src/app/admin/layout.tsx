
'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { app, messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  if (!context) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const { user, loading, translations, saveFcmToken } = context;
  const t = translations; 

  const requestNotificationPermission = async (uid: string) => {
    if (!messaging) {
      console.log("Firebase Messaging is not available.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = 'BNP42A-5e5u435PeZrpNaFw047JuzoxQasZWM4EihkL3fuQV6-awqWYrNDTKLhVGuL1r6fVON3rqfZzn72_GBbo';
        const fcmToken = await getToken(messaging, { vapidKey });
        
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          await saveFcmToken(uid, fcmToken);
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  };

  // useEffect(() => {
  //   if (!loading) {
  //     const isAuthPage = pathname === '/admin/login'; 
  //     if (!user && !isAuthPage) {
  //       router.push('/admin/login');
  //     } else if (user) {
  //       if (user.role !== 'admin') {
  //          router.push('/');
  //       } else if (isAuthPage) {
  //         router.push('/admin');
  //       } else {
  //         // If admin is logged in, request notification permission
  //         requestNotificationPermission(user.uid);
  //       }
  //     }
  //   }
  // }, [user, loading, router, pathname]);
  
  
  // if (loading || (!user && pathname !== '/admin/login')) {
  //    return (
  //       <div className="flex h-screen w-full items-center justify-center">
  //           <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //       </div>
  //   );
  // }
  
  // if (user && user.role !== 'admin') {
  //      return (
  //       <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
  //           <Card className="w-full max-w-md text-center">
  //               <CardHeader>
  //                   <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert className="text-destructive h-8 w-8"/>{t.accessDenied}</CardTitle>
  //               </CardHeader>
  //               <CardContent>
  //                   <p>{t.onlyAdminsCanAccess}</p>
  //               </CardContent>
  //           </Card>
  //       </div>
  //   );
  // }

  return <>{children}</>;
}
