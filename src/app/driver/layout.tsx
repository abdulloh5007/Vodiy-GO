
'use client';

import { useContext, useEffect, useMemo } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  if (!context) {
    // This case should ideally not happen if the provider is at the root
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const { user, drivers, loading } = context;
  
  const driverProfile = useMemo(() => {
    if (!user) return null;
    return drivers.find(d => d.id === user.uid);
  }, [user, drivers]);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/driver/login' || pathname === '/driver/register';
      const isDiagnosticsPage = pathname === '/driver/profile/diagnostics';
      
      if (!user && !isAuthPage) {
        router.push('/driver/login');
        return;
      }

      if (user) {
        if (user.role !== 'driver') {
          router.push('/');
          return;
        }

        // Core redirection logic for drivers
        if (!driverProfile && !isDiagnosticsPage) {
          // If no driver profile exists, they must complete diagnostics.
           router.push('/driver/profile/diagnostics');
        } else if (driverProfile && driverProfile.status !== 'verified' && pathname === '/driver/create-ride') {
          // If driver is not verified, they cannot create a ride.
          // Redirect them to check their status.
          router.push('/driver/profile/diagnostics');
        }
      }
    }
  }, [user, loading, driverProfile, router, pathname]);
  
  const isAuthPage = pathname === '/driver/login' || pathname === '/driver/register';

  if (loading || (!user && !isAuthPage)) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return <>{children}</>;
}
