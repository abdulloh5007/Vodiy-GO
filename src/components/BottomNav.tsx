
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
      bg-white/5 backdrop-blur-2xl rounded-full border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] 
      ring-1 ring-white/10 px-3 sm:px-5 flex items-center justify-around transition-all duration-300">
      
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium w-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                `relative inline-flex flex-col items-center justify-center px-4 py-2 rounded-full 
                transition-all duration-200 ease-out group overflow-hidden`,
                isActive
                  ? 'bg-white/20 text-white ring-1 ring-primary/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              {!!link.badge && Number(link.badge) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-red-500 text-white shadow-md">
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
