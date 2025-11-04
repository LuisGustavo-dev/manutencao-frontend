import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { AuthProvider } from '@/app/contexts/authContext'; // <--- IMPORTANTE
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrandTech Manutenção',
  description: 'Sistema de Gerenciamento de Manutenção',
};

/**
 * Este é o layout raiz.
 * 1. Ele provê o AuthContext para TODO o aplicativo.
 * 2. Ele NÃO tem navbar ou sidebar.
 * 3. Ele renderiza o {children}, que será ou o Layout Público ou o Layout do Dashboard.
 */
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
        <Toaster position="top-right" />
      </body>
    </html>
  );
}