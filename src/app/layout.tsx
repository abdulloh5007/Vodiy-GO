import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from '@/components/Header';
import { Toaster } from "@/components/ui/toaster"
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Vodiy GO',
  description: 'Reliable rides, anytime.', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased"> 
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider> 
            <div className="relative flex min-h-screen w-full flex-col">
              <Header />
              <main className="flex-1 pt-4 pb-20" style={{ paddingBottom: '100px' }}>
                {children}
              </main> 
              <BottomNav />
            </div>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
