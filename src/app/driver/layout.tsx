'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();

  if (!context) {
    // This case should ideally not happen if the provider is at the root
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const { user, loading } = context;

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'driver') {
        router.push('/driver/login');
      }
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return <>{children}</>;
}
