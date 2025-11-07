import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { AuthProvider } from '@/app/contexts/authContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MGR Refrigeração', 
  description: 'Sistema de Gerenciamento de Manutenção MGR',
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
          inter.className
        )}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Local para os pop-ups de notificação (toast) */}
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}