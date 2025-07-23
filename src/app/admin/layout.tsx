
'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const { user, loading, translations } = context;
  const t = translations;

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/admin/login';
      if (!user && !isAuthPage) {
        router.push('/admin/login');
      } else if (user && user.role !== 'admin') {
         router.push('/');
      }
    }
  }, [user, loading, router, pathname]);
  
  if (loading || (!user && pathname !== '/admin/login')) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (user && user.role !== 'admin') {
       return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert className="text-destructive h-8 w-8"/>{t.accessDenied}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t.onlyAdminsCanAccess}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return <>{children}</>;
}
