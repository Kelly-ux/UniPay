
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// Removed GeistMono import as it was causing issues and not explicitly used.
// If needed, ensure 'geist' package is correctly installed and configured.
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { DuesProvider } from '@/contexts/dues-context'; // Added DuesProvider

export const metadata: Metadata = {
  title: 'UniPay - University Payment Management',
  description: 'Manage your university dues and payments effortlessly with UniPay.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(GeistSans.variable, "dark")} style={{colorScheme: 'dark'}}>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <DuesProvider> {/* Added DuesProvider */}
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Toaster />
          </DuesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
