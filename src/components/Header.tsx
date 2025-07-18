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
import { LogIn, Menu, Car, FileText, LogOut, Home, User, ShoppingBag, ShieldCheck } from 'lucide-react';
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

  const { translations, user, logout, loading, drivers } = context;
  const t = translations;
  
  const driverProfile = useMemo(() => {
    if (!user) return null;
    return drivers.find(d => d.id === user.uid)
  }, [user, drivers]);

  if (!t.home) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center" />
      </header>
    )
  }

  const driverLinks = [
    { href: '/', label: t.home, icon: Home },
    { href: '/my-orders', label: t.myOrders, icon: ShoppingBag }
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
                <div className="grid grid-cols-2 gap-4">
                    {driverLinks.map(link => (
                        <Button 
                            key={link.href}
                            variant={pathname === link.href ? 'secondary' : 'outline'} 
                            asChild 
                            className="h-24 flex-col gap-2 text-sm"
                        >
                            <Link href={link.href}><link.icon className="mb-1"/><span>{link.label}</span></Link>
                        </Button>
                    ))}
                </div>
                <Button 
                    key={driverWideLink.href}
                    variant={pathname === driverWideLink.href ? 'secondary' : 'outline'} 
                    asChild
                    className="w-full"
                >
                    <Link href={driverWideLink.href}><driverWideLink.icon/><span>{driverWideLink.label}</span></Link>
                </Button>
              </div>
            )}
             {user?.role === 'admin' && (
              <div className='flex flex-col gap-4'>
                <div className="grid grid-cols-2 gap-4">
                    {adminLinks.map(link => (
                        <Button 
                            key={link.href}
                            variant={pathname === link.href ? 'secondary' : 'outline'} 
                            asChild 
                            className="h-24 flex-col gap-2 text-sm"
                        >
                            <Link href={link.href}><link.icon className="mb-1"/><span>{link.label}</span></Link>
                        </Button>
                    ))}
                </div>
              </div>
            )}
        </div>
        <div className="mt-auto flex flex-col gap-2">
            {user?.role === 'driver' && driverBottomLinks.map(link => (
               <Button 
                    key={link.href}
                    variant={pathname === link.href ? 'secondary' : 'ghost'} 
                    asChild
                >
                    <Link href={link.href}><link.icon/><span>{link.label}</span></Link>
                </Button>
            ))}
             <Button variant="outline" onClick={logout} className="w-full justify-center text-destructive hover:text-destructive border-destructive/50 hover:bg-destructive/10">
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
