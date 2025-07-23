
'use client';

import { useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { LogIn, Menu, Car, FileText, LogOut, Home, User, ShoppingBag, ShieldCheck, Settings, Globe, PackageCheck, Bell, UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';

export function Header() {
  const context = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!context) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center" />
      </header>
    )
  }

  const { translations, user, logout, loading, drivers, rides, orders } = context;
  const t = translations;
  
  const driverProfile = useMemo(() => {
    if (!user) return null;
    return drivers.find(d => d.id === user.uid)
  }, [user, drivers]);

  const newRideApplicationsCount = useMemo(() => {
    if (user?.role !== 'admin') return 0;
    return rides.filter(r => r.status === 'pending').length;
  }, [user, rides]);

  const newDriverApplicationsCount = useMemo(() => {
     if (user?.role !== 'admin') return 0;
    return drivers.filter(d => d.status === 'pending').length;
  }, [user, drivers]);
  
  const handleLogout = async () => {
    const userRole = user?.role;
    await logout();
    setIsSheetOpen(false);
    // Redirect to home page after logout for all roles
    router.push('/');
  };


  if (!t.home) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center" />
      </header>
    )
  }

  const adminLinks = [
    { href: '/admin', label: t.registrationApplications, icon: UserCog, badge: newDriverApplicationsCount },
    { href: '/admin/ride-applications', label: t.rideApplications, icon: PackageCheck, badge: newRideApplicationsCount }
  ];

  const passengerLinks = [
    { href: '/my-orders', label: t.myOrders, icon: ShoppingBag },
  ];

  const renderAdminMenu = () => (
     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
           {(newDriverApplicationsCount + newRideApplicationsCount > 0) && <Badge variant="destructive" className="absolute top-1 right-1 scale-75 animate-pulse">{newDriverApplicationsCount + newRideApplicationsCount}</Badge>}
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{user?.name || user?.email}</SheetTitle>
        </SheetHeader>
        <div className="flex-grow py-4">
            <div className='flex flex-col gap-4'>
              <div className="grid grid-cols-1 gap-4">
                  {adminLinks.map(link => (
                      <Button 
                          key={link.href}
                          variant={pathname === link.href ? 'secondary' : 'outline'} 
                          asChild 
                          className="h-28 flex-col gap-2 text-sm rounded-lg relative"
                          onClick={() => setIsSheetOpen(false)}
                      >
                          <Link href={link.href}>
                            {link.badge && link.badge > 0 ? <Badge variant="destructive" className="absolute top-2 right-2">{link.badge}</Badge> : ''}
                            <link.icon className="mb-1 h-8 w-8"/>
                            <span>{link.label}</span>
                          </Link>
                      </Button>
                  ))}
              </div>
            </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
             <Button 
                variant="destructive" 
                onClick={handleLogout} 
                className="w-full justify-start rounded-lg bg-red-600/90 hover:bg-red-600 text-white"
             >
                <LogOut />
                <span>{t.logout}</span>
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  const renderPassengerMenu = () => (
     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{user?.name || user?.email}</SheetTitle>
        </SheetHeader>
        <div className="flex-grow py-4">
          <nav className="flex flex-col gap-2">
            {passengerLinks.map(link => (
              <Button 
                key={link.href}
                variant={pathname === link.href ? 'secondary' : 'ghost'} 
                asChild
                className="justify-start"
                onClick={() => setIsSheetOpen(false)}
              >
                <Link href={link.href} className="flex items-center gap-2">
                  <link.icon className="h-5 w-5"/>
                  <span>{link.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-2">
             <Button 
                variant="destructive" 
                onClick={handleLogout} 
                className="w-full justify-start rounded-lg bg-red-600/90 hover:bg-red-600 text-white"
             >
                <LogOut className="mr-2 h-5 w-5"/>
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
          <span className="font-bold font-headline sm:inline-block">Vodiy GO</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className='flex items-center space-x-2'>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {loading ? null : (
            <>
                {user?.role === 'passenger' && renderPassengerMenu()}
                {user?.role === 'admin' && renderAdminMenu()}
                {!user}
                {user?.role === 'driver' && (
                    <Button variant="ghost" className="hidden md:flex" onClick={logout}><LogOut className='mr-2'/> {t.logout}</Button>
                 )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
