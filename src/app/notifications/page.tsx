
'use client';

// This page is a redirect placeholder.
// The main page is at /driver/notifications
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.push('/driver/notifications');
    }, [router]);
    
  return (
    <div className="container mx-auto py-8 px-4">
      <p>Redirecting...</p>
    </div>
  );
}
