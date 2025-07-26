
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
    { href: '/driver/create-ride', label: translations.createRide || 'Create Ride', icon: Car },
    { href: '/driver/messages', label: translations.messages_title || "Messages", icon: MessageSquare },
    { href: '/driver/my-orders', label: translations.myOrders || 'Bookings', icon: ShoppingBag, badge: newOrdersCount },
    { href: '/driver/profile', label: translations.profile_title || "Profile", icon: UserIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 
      w-[95%] h-16 bg-slate-100/80 dark:bg-black/50 border border-slate-300 dark:border-white/20 backdrop-blur-xl 
      rounded-full shadow-xl ring-1 ring-black/5 dark:ring-white/10 flex items-center px-2 py-2">

      <div className="grid grid-cols-4 gap-1 w-full h-full">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                `relative flex flex-col items-center justify-center rounded-full transition-all duration-200 
                ease-out group text-xs`,
                isActive
                  ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-inner ring-1 ring-primary/50'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
              )}
            >
              {!!link.badge && Number(link.badge) > 0 && (
                <Badge className="absolute top-1.5 right-1.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-red-500 text-white shadow-md">
                  {link.badge}
                </Badge>
              )}
              <link.icon className="w-5 h-5 mb-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
