'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@/contexts/AppContext';
import { RoadPilotLogo } from '@/components/icons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, LogIn } from 'lucide-react';


export function Header() {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }

  const { language, translations, user, logout } = context;
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <RoadPilotLogo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">RoadPilot</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">{t.home}</Link>
          <Link href="/register-driver" className="transition-colors hover:text-primary">{t.registerDriver}</Link>
          {user && user.role === 'driver' && (
            <Link href="/create-ride" className="transition-colors hover:text-primary">{t.createRide}</Link>
          )}
          {user && user.role === 'admin' && (
            <Link href="/admin" className="transition-colors hover:text-primary">{t.adminPanel}</Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSwitcher />
          <Separator orientation="vertical" className="h-6" />
          {user ? (
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>{t.logout}</Button>
            </div>
          ) : (
             <Button asChild variant="ghost" size="sm">
                <Link href="/admin/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Admin Login
                </Link>
             </Button>
          )}
        </div>
      </div>
    </header>
  );
}
