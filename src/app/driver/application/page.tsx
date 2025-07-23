
'use client';

// This page is a redirect placeholder.
// The main application form is now at /driver/profile
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverApplicationRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.push('/driver/profile');
    }, [router]);
    
  return (
    <div className="container mx-auto py-8 px-4">
      <p>Redirecting to profile...</p>
    </div>
  );
}
