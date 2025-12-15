"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react"; // Importando o relógio

// --- Importações do Menu de Perfil ---
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
  User as UserIcon, 
  Loader2,
} from "lucide-react"; 

// --- Configuração de Menu do Colaborador ---
const colaboradorMenuConfig = [
    {
        label: "Meu Trabalho",
        items: [
            { name: "Registrar Ponto", icon: Clock, path: "/dashboard/colaborador", allowedRoles: ['Colaborador'] },
        ]
    },
];

export default function ColaboradorNavbar() {
  const { role, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Define o papel atual (padrão para Colaborador se não houver)
  const currentRole = role || "Colaborador"; 

  useEffect(() => { 
      if (loadingPath) setLoadingPath(null); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Filtra o menu (embora aqui seja fixo, mantemos a lógica para consistência)
  const accessibleMenuGroups = colaboradorMenuConfig;

  const handleLogout = () => { logout(); toast.success("Até logo!"); };
  
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
  
  // --- Dados do Usuário (Fallback para Colaborador) ---
  const userName = user?.nome || "Colaborador";
  const userEmail = user?.email || "colaborador@mgr.com";
  const userFallback = userName.charAt(0).toUpperCase();

  const renderDropdownItem = (item: any) => {
      const Icon = item.icon;
      const targetPath = item.path; 
      
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

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      
      {/* Logo Mobile */}
      <Link href="/dashboard/colaborador" className="flex md:hidden items-center space-x-2">
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
    </header>
  );
}