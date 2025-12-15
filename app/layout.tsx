import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { AuthProvider } from '@/app/contexts/authContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans', 
});

export const metadata: Metadata = {
  title: {
    default: 'MGR Refrigeração', 
    template: '%s | MGR Refrigeração', 
  },
  icons: {
    icon: '/favicon.ico', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable 
        )}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}