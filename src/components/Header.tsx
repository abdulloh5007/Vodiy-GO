'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@/contexts/AppContext';
import { RoadPilotLogo } from '@/components/icons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogIn, Menu, Car, FileText } from 'lucide-react';

export function Header() {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }

  const { language, translations, user, logout, loading } = context;
  const t = translations;

  // Wait for translations to be loaded
  if (!t.home) {
    return (
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
            {/* Render a minimal header or a loading state */}
        </div>
      </header>
    )
  }

  const getAvatarFallback = (email: string | null | undefined) => {
    return email ? email.charAt(0).toUpperCase() : <User className="h-5 w-5" />;
  };

  const renderUserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt={user?.email || ''} />
            <AvatarFallback>{getAvatarFallback(user?.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.role}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.role === 'admin' && (
           <DropdownMenuItem asChild>
             <Link href="/admin"><FileText className="mr-2 h-4 w-4" /><span>{t.registrationApplications}</span></Link>
           </DropdownMenuItem>
        )}
        {user?.role === 'driver' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/register-driver"><Car className="mr-2 h-4 w-4" /><span>{t.carSettings || "Car Settings"}</span></Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href="/create-ride"><FileText className="mr-2 h-4 w-4" /><span>{t.createRide}</span></Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>{t.logout}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  const renderNavLinksForMobile = () => (
      <nav className="flex flex-col space-y-4 pt-6 text-sm font-medium">
         {/* Future mobile links can go here */}
      </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <RoadPilotLogo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">RoadPilot</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSwitcher />
          {loading ? null : user ? renderUserMenu() : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/admin/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t.loginAsDriver}
                </Link>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  {renderNavLinksForMobile()}
                  <div className="mt-6">
                     <Button asChild className="w-full">
                       <Link href="/admin/login">
                         <LogIn className="mr-2 h-4 w-4" />
                         {t.loginAsDriver}
                       </Link>
                     </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
