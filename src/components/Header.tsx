'use client';

import { useContext, useMemo } from 'react';
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
import { LogIn, Menu, Car, FileText, LogOut, Home, User, ShoppingBag, ShieldCheck, Settings, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';

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

  const { translations, user, logout, loading, drivers, rides, orders } = context;
  const t = translations;
  
  const driverProfile = useMemo(() => {
    if (!user) return null;
    return drivers.find(d => d.id === user.uid)
  }, [user, drivers]);

  const newOrdersCount = useMemo(() => {
    if (!user) return 0;
    const myRideIds = rides.filter(ride => ride.driverId === user.uid).map(r => r.id);
    if (myRideIds.length === 0) return 0;
    return orders.filter(order => myRideIds.includes(order.rideId) && order.status === 'new').length;
  }, [user, rides, orders]);

  if (!t.home) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center" />
      </header>
    )
  }

  const driverLinks = [
    { href: '/', label: t.home, icon: Home },
    { href: '/my-orders', label: t.myOrders, icon: ShoppingBag, badge: newOrdersCount > 0 ? newOrdersCount : 0 },
  ];
  
  const driverWideLink = { href: '/create-ride', label: t.publishNewRide, icon: FileText };
  
  const driverBottomLinks = [
    { href: '/register-driver', label: t.carSettings || "Car Settings", icon: Car },
  ];

  const adminLinks = [
    { href: '/admin', label: t.registrationApplications, icon: ShieldCheck }
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
          <SheetTitle>{driverProfile?.name || user?.email}</SheetTitle>
        </SheetHeader>
        <div className="flex-grow py-4">
            {user?.role === 'driver' && (
              <div className='flex flex-col gap-4'>
                <div className="hidden md:grid grid-cols-2 gap-4">
                    {driverLinks.map(link => (
                        <Button 
                            key={link.href}
                            variant={pathname === link.href ? 'secondary' : 'outline'} 
                            asChild 
                            className="h-28 flex-col gap-2 text-sm rounded-lg relative"
                        >
                            <Link href={link.href}>
                              {link.badge && link.badge > 0 && (
                                <Badge className="absolute top-2 right-2">{link.badge}</Badge>
                              )}
                              <link.icon className="mb-1 h-8 w-8"/>
                              <span>{link.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
                <Button 
                    key={driverWideLink.href}
                    variant={pathname === driverWideLink.href ? 'secondary' : 'outline'} 
                    asChild
                    className="w-full h-20 rounded-lg"
                >
                    <Link href={driverWideLink.href}><driverWideLink.icon className="h-6 w-6"/><span>{driverWideLink.label}</span></Link>
                </Button>
              </div>
            )}
             {user?.role === 'admin' && (
              <div className='flex flex-col gap-4'>
                <div className="grid grid-cols-1 gap-4">
                    {adminLinks.map(link => (
                        <Button 
                            key={link.href}
                            variant={pathname === link.href ? 'secondary' : 'outline'} 
                            asChild 
                            className="h-28 flex-col gap-2 text-sm rounded-lg"
                        >
                            <Link href={link.href}><link.icon className="mb-1 h-8 w-8"/><span>{link.label}</span></Link>
                        </Button>
                    ))}
                </div>
              </div>
            )}
            <div className="md:hidden mt-4 space-y-2">
                 <Separator />
                <p className='pt-2 text-sm text-muted-foreground'>Settings</p>
                <div className='flex justify-between items-center bg-muted p-2 rounded-lg'>
                  <span className='text-sm font-medium'>Language</span>
                  <LanguageSwitcher />
                </div>
                <div className='flex justify-between items-center bg-muted p-2 rounded-lg'>
                  <span className='text-sm font-medium'>Theme</span>
                  <ThemeToggle />
                </div>
            </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
            {user?.role === 'driver' && driverBottomLinks.map(link => (
               <Button 
                    key={link.href}
                    variant={pathname === link.href ? 'secondary' : 'ghost'} 
                    asChild
                    className="justify-start border rounded-lg"
                >
                    <Link href={link.href}><link.icon/><span>{link.label}</span></Link>
                </Button>
            ))}
             <Button 
                variant="destructive" 
                onClick={logout} 
                className="w-full justify-start rounded-lg bg-red-600/90 hover:bg-red-600 text-white"
             >
                <LogOut />
                <span>{t.logout}</span>
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const renderGuestMenu = () => (
    <Sheet>
       <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className='md:hidden'>
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
          <SheetHeader>
              <SheetTitle>{t.menu || "Menu"}</SheetTitle>
          </SheetHeader>
          <div className="flex-grow py-4 flex flex-col gap-4">
              <Button asChild className="w-full h-20 text-base">
                  <Link href="/admin/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    {t.loginAsDriver}
                  </Link>
              </Button>
          </div>
          <div className="mt-auto space-y-2">
              <Separator />
              <p className='pt-2 text-sm text-muted-foreground'>Settings</p>
              <div className='flex justify-between items-center bg-muted p-2 rounded-lg'>
                <span className='text-sm font-medium'>Language</span>
                <LanguageSwitcher />
              </div>
              <div className='flex justify-between items-center bg-muted p-2 rounded-lg'>
                <span className='text-sm font-medium'>Theme</span>
                <ThemeToggle />
              </div>
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
          <div className='hidden md:flex items-center space-x-2'>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {loading ? null : user ? renderUserMenu() : (
            <>
              <Button asChild className='hidden md:inline-flex'>
                <Link href="/admin/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t.loginAsDriver}
                </Link>
              </Button>
              {renderGuestMenu()}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
