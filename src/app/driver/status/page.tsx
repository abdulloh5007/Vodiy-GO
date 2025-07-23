
'use client';

// This page is a redirect placeholder.
// The main application status is now at /driver/profile/diagnostics
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverStatusRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.push('/driver/profile/diagnostics');
    }, [router]);
    
  return (
    <div className="container mx-auto py-8 px-4">
      <p>Redirecting to diagnostics...</p>
    </div>
  );
}

