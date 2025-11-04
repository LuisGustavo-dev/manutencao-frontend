"use client"

import React, { useState } from "react"; // <-- Importar React
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Home } from "lucide-react"; 
import { useAuth } from "@/app/contexts/authContext"; // <-- 1. Importar Auth
import { useRouter, usePathname } from "next/navigation"; // <-- 2. Importar hooks

// --- 3. Importar tudo para o Dropdown ---
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
  Users,
  User as UserIcon, 
  Loader2 
} from "lucide-react"; 
// --- Fim das importações ---

// --- 4. Configuração de Menu do Manutentor ---
// (Copiada da ManutentorSidebar para manter a consistência)
const fullMenuConfig = [
    {
        label: "Painel",
        items: [
            { name: "Visão Geral", icon: Home, path: "/dashboard/manutentor", allowedRoles: ['Manutentor', 'Admin'] },
        ]
    },
    {
        label: "Gestão",
        items: [
            { name: "Ordens de Serviço", icon: Wrench, path: "/dashboard/manutentor/ordens-servico", allowedRoles: ['Manutentor', 'Admin'] },
            { name: "Equipamentos", icon: Package, path: "/dashboard/manutentor/equipamentos", allowedRoles: ['Manutentor', 'Admin'] },
            { name: "Clientes", icon: Users, path: "/dashboard/manutentor/clientes", allowedRoles: ['Manutentor', 'Admin'] },
        ]
    },
    {
        label: "Conta", 
        items: [
            { name: "Meu Perfil", icon: UserIcon, path: "/dashboard/manutentor/perfil", allowedRoles: ['Manutentor', 'Admin'] },
        ]
    }
];

export default function ManutentorNavbar() {
  // --- 5. Adicionar Hooks e Lógica do Menu ---
  const { role, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const currentRole = role || "Manutentor";

  const accessibleMenuGroups = fullMenuConfig
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
    }))
    .filter(group => group.items.length > 0);

  const handleLogout = () => { logout(); toast.success("Você saiu com sucesso!"); };
  
  const handleClick = (item: any) => {
    if (item.path === pathname || loadingPath === item.path) return;
    if (item.disabled) toast.error(`${item.name} em construção!`);
    else if (item.action) item.action();
    else if (item.path) { setLoadingPath(item.path); router.push(item.path); }
  };

  const atalhos = [{ name: "Sair", icon: LogOut, action: handleLogout }];
  
  const userName = user?.nome || "Usuário";
  const userEmail = user?.email || "Técnico";
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
  // --- Fim da Lógica do Menu ---

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      
      {/* O Logo/Nome linka para o redirecionador */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="hidden md:inline">GrandTech</span>
      </Link>

      {/* --- 6. Menu de Perfil Adicionado --- */}
      <div className="ml-auto">
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
            
            {/* Renderiza os menus do manutentor */}
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
      </div>
      {/* --- Fim do Menu de Perfil --- */}
    </header>
  );
}