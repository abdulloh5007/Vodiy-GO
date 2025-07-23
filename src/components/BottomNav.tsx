
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
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background/80 border-t border-border backdrop-blur-lg">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 relative group',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.badge && link.badge > 0 && (
                <Badge className="absolute top-1.5 right-1.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-red-500 text-white shadow-md">
                  {link.badge}
                </Badge>
              )}
              <link.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
