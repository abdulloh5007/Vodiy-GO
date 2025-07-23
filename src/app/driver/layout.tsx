
'use client';

import { useContext, useEffect } from 'react';
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

  const { user, loading } = context;

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/driver/login' || pathname === '/driver/register';
      if (!user && !isAuthPage) {
        router.push('/driver/login');
      } else if (user && user.role !== 'driver' && !isAuthPage) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);
  
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
