
'use client';

// This page is a redirect placeholder.
// The main registration is at /driver/register
// The application form is at /driver/application
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterDriverRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.push('/driver/register');
    }, [router]);
    
  return (
    <div className="container mx-auto py-8 px-4">
      <p>Redirecting to registration...</p>
    </div>
  );
}
