'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { RoadPilotLogo } from '@/components/icons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LogIn, Menu, Car, FileText, LogOut, Home, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const context = useContext(AppContext);
  const pathname = usePathname();

  if (!context) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center" />
      </header>
    )
  }

  const { translations, user, logout, loading } = context;
  const t = translations;

  if (!t.home) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center" />
      </header>
    )
  }

  const navLinks = [
    { href: '/', label: t.home, icon: Home, roles: ['driver', 'admin'] },
    { href: '/admin', label: t.registrationApplications, icon: FileText, roles: ['admin'] },
    { href: '/register-driver', label: t.carSettings || "Car Settings", icon: Car, roles: ['driver'] },
    { href: '/create-ride', label: t.publishNewRide, icon: FileText, roles: ['driver'] },
    { href: '/my-orders', label: t.myOrders, icon: ShoppingBag, roles: ['driver'] }
  ];

  const renderUserMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{user?.email}</SheetTitle>
        </SheetHeader>
        <div className="flex-grow py-4">
            <div className="grid grid-cols-2 gap-4">
                {navLinks.filter(link => user?.role && link.roles.includes(user.role)).map(link => (
                    <Button 
                        key={link.href}
                        variant={pathname === link.href ? 'secondary' : 'outline'} 
                        asChild 
                        className="h-24 flex-col gap-2"
                    >
                        <Link href={link.href}><link.icon/><span>{link.label}</span></Link>
                    </Button>
                ))}
            </div>
        </div>
        <div className="mt-auto">
             <Button variant="ghost" onClick={logout} className="w-full justify-center text-destructive hover:text-destructive">
                <LogOut />
                <span>{t.logout}</span>
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <RoadPilotLogo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">RoadPilot</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {loading ? null : user ? renderUserMenu() : (
            <Button asChild>
              <Link href="/admin/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t.loginAsDriver}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
