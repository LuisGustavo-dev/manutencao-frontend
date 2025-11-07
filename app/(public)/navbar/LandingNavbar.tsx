'use client';

import React from 'react'; // <-- Removido 'useState' e 'useEffect'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/contexts/authContext';
// Removido: useRouter, usePathname

// --- Importações do Dropdown do Usuário ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";

// --- Ícones ATUALIZADOS ---
// Removidos todos os ícones de menu desnecessários
import { 
  LogOut, 
  LayoutDashboard // <-- Ícone para o Dashboard
} from "lucide-react"; 
// --- Fim das importações de ícones ---


// --- Lógica de menu ANTIGA (fullMenuConfig, availableRoles, etc.) REMOVIDA ---


export function LandingNavbar() {
  // --- Hooks simplificados ---
  const { token, user, role, logout } = useAuth();
  
  // --- Lógica de helpers simplificada ---
  // (Funções handleClick, accessibleMenuGroups, renderDropdownItem, etc. REMOVIDAS)
  
  const handleLogout = () => { 
    logout(); 
    toast.success("Você saiu com sucesso!"); 
  };

  const userName = user?.nome || "Usuário";
  // Mantida a lógica de exibição de nome/email
  const roleDisplayName = role === 'Admin' ? 'Admin' : role === 'Manutentor' ? 'Manutentor' : 'Cliente';
  const userEmail = user?.email || `Cargo: ${roleDisplayName}`;
  const userFallback = userName.charAt(0).toUpperCase();
  // --- Fim da lógica de helpers ---


  return (
    <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm fixed top-0 left-0 right-0 bg-background z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <div className="flex items-center justify-center">
          <img
            src="https://grandtechsistemas.com.br/assets/logo.png"
            width={100}
            height={100}
            alt="grandtech"
            className="rounded-lg object-cover"
          />
        </div>
      </Link>

      {/* Texto centralizado */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-3xl font-bold tracking-tighter">
          GrandTech
        </h1>
      </div>

      {/* --- NAV CONDICIONAL --- */}
      <div className="ml-auto flex gap-4 sm:gap-6 items-center">
        {token ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white">
                      {userFallback}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* --- MENU ATUALIZADO E SIMPLIFICADO --- */}
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
                
                {/* --- FIM DO MENU ATUALIZADO --- */}

              </DropdownMenuContent>
            </DropdownMenu>
          </>

        ) : (
          <>
            <Button size="sm" asChild>
              <Link href="/login">Acessar conta</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}