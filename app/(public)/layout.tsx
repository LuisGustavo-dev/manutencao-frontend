import { LandingNavbar } from '@/app/(public)/navbar/LandingNavbar';
import { LandingFooter } from '@/app/(public)/navbar/LandingFooter';

/**
 * Este layout envolve TODAS as páginas dentro da pasta (public),
 * ou seja, a Landing Page, a página de Login e a pág. do Equipamento.
 * Ele NÃO se aplica ao /dashboard.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      {/* Adiciona o padding-top para compensar a navbar fixa */}
      <main className="pt-14 min-h-screen">
        {children}
      </main>
      <LandingFooter />
    </>
  );
}