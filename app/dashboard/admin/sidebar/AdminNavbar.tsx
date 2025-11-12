"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Home, HardHat } from "lucide-react"; 

// --- 1. Importações do Menu de Perfil ---
import { useAuth } from "@/app/contexts/authContext"; 
import { useRouter, usePathname } from "next/navigation"; 
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
  Loader2,
  Settings
} from "lucide-react"; 
// --- Fim das importações ---

// --- 2. Lógica de Menu (Copiada da AdminSidebar) ---
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
            { name: "Ordens de Serviço", icon: Wrench, path: "/dashboard/admin/ordens-servico", allowedRoles: ['Admin'] },
            { name: "Equipamentos", icon: Package, path: "/dashboard/admin/equipamentos", allowedRoles: ['Admin'] },
            { name: "Clientes", icon: Users, path: "/dashboard/admin/clientes", allowedRoles: ['Admin'] },
            { name: "Técnicos", icon: HardHat, path: "/dashboard/admin/tecnicos", allowedRoles: ['Admin'] },
          ]
    },
];

const availableRoles = [
    { id: 'Admin', nome: 'Admin (Simular)' },
    { id: 'Manutentor', nome: 'Manutentor (Simular)' },
    { id: 'Cliente', nome: 'Cliente (Simular)' },
];
// --- Fim da Lógica de Menu ---

export default function AdminNavbar() {
  // --- 3. Hooks e Lógica de Estado ---
  const { role, logout, user } = useAuth(); // Removido 'setRole' (está na sidebar)
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const currentRole = role || "Admin"; 

  useEffect(() => { 
      if (loadingPath) setLoadingPath(null); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const accessibleMenuGroups = fullMenuConfig
      .map(group => ({
          ...group,
          items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
      }))
      .filter(group => group.items.length > 0);

  const handleLogout = () => { logout(); toast.success("Você saiu com sucesso!"); };
  
  const handleClick = (item: any) => {
      if (item.disabled) toast.error(`${item.name} em construção!`);
      else if (item.action) item.action();
      else if (item.path) { 
          if (item.path === pathname || loadingPath === item.path) return;
          setLoadingPath(item.path); 
          router.push(item.path); 
      }
  };

  const atalhos = [{ name: "Sair", icon: LogOut, action: handleLogout }];
  
  const userName = user?.nome || "Usuário";
  const roleDisplayName = availableRoles.find(r => r.id === currentRole)?.nome.replace(" (Simular)", "") || currentRole;
  const userEmail = user?.email || `Cargo: ${roleDisplayName}`;
  const userFallback = userName.charAt(0).toUpperCase();

  const renderDropdownItem = (item: any) => {
      const Icon = item.icon;
      let targetPath = item.path; 

      if (targetPath) {
          if (currentRole !== 'Admin' && !targetPath.startsWith('/dashboard/admin')) {
              targetPath = targetPath.replace('/dashboard/', `/dashboard/${currentRole.toLowerCase()}/`);
          }
      }
      
      const isLoading = loadingPath === targetPath;
      const isActive = pathname === targetPath;

      return (
          <DropdownMenuItem
              key={item.name}
              onClick={() => handleClick({...item, path: targetPath})}
              className={`${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${isLoading ? "cursor-wait opacity-70" : ""} ${isActive ? "bg-primary/10 text-primary cursor-default" : ""} `}
              disabled={isLoading || item.disabled}
          >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
              {item.name}
          </DropdownMenuItem>
      );
  };
  // --- Fim da Lógica ---

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      
      <Link href="/dashboard" className="flex md:hidden items-center space-x-2">
        <div className="flex items-center justify-center">
          <img
            src="/assets/logo.png"
            width={55}
            height={40}
            alt="logo"
            className="rounded-lg object-cover"
          />
        </div>
      </Link>

      {/* --- 4. Menu de Perfil Adicionado --- */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-white">
                  <UserIcon className="h-5 w-5" />
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