'use client';

import React, { useState } from 'react'; // <-- Importar React
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/contexts/authContext'; // <-- 1. Importar o hook de Auth
import { useRouter, usePathname } from 'next/navigation';

// --- 2. Importar tudo para o Dropdown do Usuário ---
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
import { 
  LogOut, 
  Wrench, 
  Package, 
  Home, 
  Users, 
  User as UserIcon, 
  Loader2, 
  Settings, 
  Package2, // (ícone do logo original)
  ShieldCheck
} from "lucide-react"; 
// --- Fim das novas importações ---


// --- 3. Copiar a lógica de menu da AppSidebar ---
// (Isso garante que os menus sejam idênticos)

const fullMenuConfig = [
    {
        label: "Painel",
        items: [
            { name: "Visão Geral (Admin)", icon: Home, path: "/dashboard/admin", allowedRoles: ['Admin'] },
            { name: "Visão Geral (Man.)", icon: Home, path: "/dashboard/manutentor", allowedRoles: ['Manutentor'] },
            { name: "Meus Chamados", icon: Home, path: "/dashboard/cliente", allowedRoles: ['Cliente'] },
        ]
    },
    {
        label: "Gestão",
        items: [
            { name: "Ordens de Serviço", icon: Wrench, path: "/dashboard/ordens-servico", allowedRoles: ['Admin', 'Manutentor', 'Cliente'] },
            { name: "Equipamentos", icon: Package, path: "/dashboard/equipamentos", allowedRoles: ['Admin', 'Manutentor', 'Cliente'] },
            { name: "Clientes", icon: Users, path: "/dashboard/clientes", allowedRoles: ['Admin', 'Manutentor'] },
        ]
    },
    {
        label: "Administração", 
        items: [
            { name: "Gerenciar Usuários", icon: UserIcon, path: "/dashboard/admin/usuarios", allowedRoles: ['Admin'] },
            { name: "Configurações", icon: Settings, path: "/dashboard/admin/settings", allowedRoles: ['Admin'] },
            { name: "Meu Perfil", icon: UserIcon, path: "/dashboard/perfil", allowedRoles: ['Admin', 'Manutentor', 'Cliente'] },
        ]
    }
];

const availableRoles = [
    { id: 'Admin', nome: 'Admin (Simular)' },
    { id: 'Manutentor', nome: 'Manutentor (Simular)' },
    { id: 'Cliente', nome: 'Cliente (Simular)' },
];
// --- Fim da lógica de menu ---


export function LandingNavbar() {
  // --- 4. Hooks para o menu funcionar ---
  const { token, user, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // --- 5. Lógica de helpers copiada da AppSidebar ---
  const currentRole = role || "Cliente"; 

  const accessibleMenuGroups = fullMenuConfig
      .map(group => ({
          ...group,
          items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
      }))
      .filter(group => group.items.length > 0);

  const handleLogout = () => { logout(); toast.success("Você saiu com sucesso!"); };

  const handleClick = (item: any) => {
      if (item.path === pathname || loadingPath) return;
      if (item.disabled) toast.error(`${item.name} em construção!`);
      else if (item.action) item.action();
      else if (item.path) { setLoadingPath(item.path); router.push(item.path); }
  };

  const atalhos = [{ name: "Sair", icon: LogOut, action: handleLogout }];
  
  const userName = user?.nome || "Usuário";
  const roleDisplayName = availableRoles.find(r => r.id === currentRole)?.nome.replace(" (Simular)", "") || currentRole;
  const userEmail = user?.email || `Cargo: ${roleDisplayName}`;
  const userFallback = userName.charAt(0).toUpperCase();

  const renderDropdownItem = (item: any) => {
      const Icon = item.icon;
      const isLoading = loadingPath === item.path;
      const isActive = pathname === item.path;

      return (
          <DropdownMenuItem
              key={item.name}
              onClick={() => handleClick(item)}
              className={`${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${isLoading ? "cursor-wait opacity-70" : ""} ${isActive ? "bg-primary/10 text-primary cursor-default" : ""} `}
              disabled={isLoading || item.disabled}
          >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
              {item.name}
          </DropdownMenuItem>
      );
  };
  // --- Fim da lógica de helpers ---


  return (
    <header className="px-4 lg:px-6 h-14 flex items-center shadow-sm fixed top-0 left-0 right-0 bg-background z-50">
      <Link href="/" className="flex items-center justify-center">
        {/* Ícone trocado para o de 'ShieldCheck' para bater com a sidebar */}
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="sr-only">GrandTech Manutenção</span>
        <span className="font-bold text-lg ml-2">GrandTech Man.</span>
      </Link>

      {/* --- 6. NAV CONDICIONAL --- */}
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        {token ? (
          // --- ESTADO LOGADO ---
          <>
            <Link
              href="/#features"
              className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" // Oculta em mobile
            >
              Recursos
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Acessar Painel</Link>
            </Button>
            
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
              <DropdownMenuContent className="w-64" align="end" forceMount> {/* <-- Um pouco mais largo */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Renderiza o menu exatamente como na sidebar */}
                {accessibleMenuGroups.map((group, groupIndex) => (
                    <React.Fragment key={group.label}>
                        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                        {group.items.map((item) => renderDropdownItem(item))}
                        {groupIndex < accessibleMenuGroups.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                ))}
                <DropdownMenuSeparator />
                {atalhos.map(renderDropdownItem)}

              </DropdownMenuContent>
            </DropdownMenu>
          </>

        ) : (
          // --- ESTADO DESLOGADO (O seu original) ---
          <>
            <Link
              href="#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Recursos
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Como Funciona
            </Link>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}