'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();

  // Это начальное состояние, пока контекст не загрузился
  if (!context) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const { user, loading } = context;

  useEffect(() => {
    // Ждем окончания загрузки, чтобы принять решение
    if (!loading) {
      // Если после загрузки пользователя нет или он не админ, перенаправляем
      if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  // Пока идет загрузка или если пользователь не определен как админ, показываем загрузчик
  if (loading || user?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Если все проверки пройдены, показываем содержимое страницы
  return <>{children}</>;
}
