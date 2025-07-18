import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';
import { Header } from '@/components/Header';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'RoadPilot',
  description: 'Reliable rides, anytime.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <div className="relative flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 pt-4">
              {children}
            </main>
          </div>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
