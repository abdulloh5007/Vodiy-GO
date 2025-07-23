
'use client';

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Bell, Car, Home, ShoppingBag, User as UserIcon, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const context = useContext(AppContext);
  const pathname = usePathname();

  if (!context) {
    return null;
  }

  const { user, translations, rides, orders } = context;

  const newOrdersCount = useMemo(() => {
    if (!user) return 0;
    const myRideIds = rides.filter(ride => ride.driverId === user.uid).map(r => r.id);
    if (myRideIds.length === 0) return 0;
    return orders.filter(order => myRideIds.includes(order.rideId) && order.status === 'new').length;
  }, [user, rides, orders]);

  if (!user || user.role !== 'driver') {
    return null;
  }

  const navLinks = [
    { href: '/driver/create-ride', label: translations.home || 'Home', icon: Home },
    { href: '/driver/messages', label: translations.messages_title || "Messages", icon: MessageSquare },
    { href: '/driver/my-orders', label: translations.myOrders || 'Bookings', icon: ShoppingBag, badge: newOrdersCount },
    { href: '/driver/profile', label: translations.profile_title || "Profile", icon: UserIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[95%] h-16 
    border bg-card/80 backdrop-blur-xl rounded-full shadow-lg
    flex items-center justify-around px-2">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium w-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                `relative inline-flex flex-col items-center justify-center gap-0.5 px-3 sm:px-5 py-2 rounded-full transition-all duration-200 ease-out group`,
                isActive
                  ? 'bg-primary/90 text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {!!link.badge && Number(link.badge) > 0 && (
                <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">{link.badge}</Badge>
              )}
              <link.icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] sm:text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>  
  );
}
