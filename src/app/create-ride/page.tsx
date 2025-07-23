
'use client';

// This page is a redirect placeholder.
// The main page is at /driver/create-ride
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRideRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.push('/driver/create-ride');
    }, [router]);
    
  return (
    <div className="container mx-auto py-8 px-4">
      <p>Redirecting...</p>
    </div>
  );
}
