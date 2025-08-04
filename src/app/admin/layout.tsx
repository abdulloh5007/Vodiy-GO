

'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PinLockProvider } from '@/contexts/PinLockContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  // Это начальное состояние, пока контекст не загрузился
  if (!context) {
    return ( 
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const { user, loading } = context;
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (loading) return; // Не делать ничего, пока идет загрузка

    // Если пользователь - админ и пытается зайти на страницу логина, перенаправляем в админку
    if (user?.role === 'admin' && isLoginPage) {
      router.push('/admin');
    }
    
    // Если пользователь не админ и пытается зайти НЕ на страницу логина, перенаправляем на главную
    if (user?.role !== 'admin' && !isLoginPage) {
      router.push('/');
    }

  }, [user, loading, router, isLoginPage]);

  // Показываем загрузчик, пока идет проверка
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Если это страница логина, показываем контент без защиты
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Если пользователь - админ, показываем контент с защитой
  if (user?.role === 'admin') {
     return (
      <PinLockProvider>
        {children}
      </PinLockProvider>
     );
  }
  
  // В противном случае (не админ и не страница логина) показываем загрузчик, пока происходит редирект
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
