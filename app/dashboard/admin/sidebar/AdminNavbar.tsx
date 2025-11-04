"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Home } from "lucide-react"; 

export default function AdminNavbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      
      {/* O Logo/Nome linka para o redirecionador */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="hidden md:inline">GrandTech</span>
      </Link>

      {/* Botão de Início */}
      <Button variant="ghost" size="icon" asChild>
        <Link href="/dashboard" title="Voltar ao Painel Principal">
          <Home className="h-5 w-5" />
        </Link>
      </Button>
      
      <div className="ml-auto">
         {/* O menu de perfil/logout está na sidebar */}
      </div>
    </header>
  );
}