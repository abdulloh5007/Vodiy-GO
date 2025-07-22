
'use client';

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Home, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    { href: '/', label: translations.home || 'Home', icon: Home },
    { href: '/my-orders', label: translations.myOrders || 'Bookings', icon: ShoppingBag, badge: newOrdersCount > 0 ? newOrdersCount : 0 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex flex-col items-center justify-center px-5 relative group ${
              pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {link.badge && link.badge > 0 && (
              <Badge className="absolute top-1 right-1/4 scale-75">{link.badge}</Badge> 
            )}
            <link.icon className="w-6 h-6 mb-1" />
            <span className="text-sm">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
