"use client"

import React, { useState, useMemo } from "react"; // <-- Corrigido (useMemo)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/authContext"; 
import { useRouter, usePathname } from "next/navigation"; 

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
  User as UserIcon, 
  Loader2,
  Home,
  ChevronRight
} from "lucide-react"; 

// --- Configuração de Menu do Cliente (Sidebar) ---
const fullMenuConfig = [
    {
        label: "Painel",
        items: [
            { name: "Meus Chamados", icon: Home, path: "/dashboard/cliente", allowedRoles: ['Cliente', 'Admin'] },
        ]
    },
    {
        label: "Gestão",
        items: [
            { name: "Ordens de Serviço", icon: Wrench, path: "/dashboard/cliente/ordens-servico", allowedRoles: ['Cliente', 'Admin'] },
            { name: "Equipamentos", icon: Package, path: "/dashboard/cliente/equipamentos", allowedRoles: ['Cliente', 'Admin'] },
        ]
    },
    {
        label: "Conta", 
        items: [
            { name: "Meu Perfil", icon: UserIcon, path: "/dashboard/cliente/perfil", allowedRoles: ['Cliente', 'Admin'] },
        ]
    }
];

// --- 1. NOVO MAPA DE ROTAS (Mais Robusto) ---
// Mapeia o *path completo* para o nome que deve aparecer.
const BREADCRUMB_MAP: { [key: string]: string } = {
  '/dashboard/cliente': 'Meus Chamados',
  '/dashboard/cliente/ordens-servico': 'Ordens de Serviço',
  '/dashboard/cliente/ordens-servico-detalhe': 'Detalhes da O.S.',
  '/dashboard/cliente/equipamentos': 'Equipamentos',
  '/dashboard/cliente/perfil': 'Meu Perfil'
};
// --- FIM DO NOVO MAPA ---

// --- 2. NOVA FUNÇÃO generateBreadcrumbs ---
const generateBreadcrumbs = (pathname: string) => {
  const breadcrumbs = [];
  const pathSegments = pathname.split('/').filter(segment => segment);
  let currentPath = '';

  for (const segment of pathSegments) {
    currentPath += `/${segment}`;

    // Só adiciona ao breadcrumb se o path COMPLETO estiver no mapa
    if (BREADCRUMB_MAP[currentPath]) {
      breadcrumbs.push({
        name: BREADCRUMB_MAP[currentPath],
        path: currentPath
      });
    }
    // Se não estiver no mapa (ex: um ID como '9' ou 'eq-123'),
    // ele é simplesmente ignorado e não aparece no breadcrumb.
  }
  return breadcrumbs;
};
// --- FIM DA NOVA FUNÇÃO ---

export default function ClienteNavbar() {
  const { role, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // --- 3. GERA OS BREADCRUMBS (usando a nova função) ---
  const breadcrumbItems = useMemo(() => generateBreadcrumbs(pathname), [pathname]);

  const currentRole = role || "Cliente";

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
  const userEmail = user?.email || "Cliente";
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

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      
      {/* --- 4. BREADCRUMB (Visível em MD+) --- */}
      {/* Esta lógica agora está correta e segura */}
      <div className="hidden md:flex">
        <Breadcrumb>
          <BreadcrumbList>
            {/* O primeiro item é sempre o link da Home (Dashboard) */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/cliente">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbItems.length > 0 && <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>}

            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.path}>
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage className="font-semibold">{item.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.path}>{item.name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* --- 5. MENU DE PERFIL (Dropdown) --- */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              
              {/* LOGO (Apenas telas pequenas) */}
              <div className="flex md:hidden items-center justify-center">
                <img
                  src="/assets/logo.png"
                  width={32} 
                  height={32}
                  alt="logo"
                  className="rounded-lg object-contain"
                />
              </div>

              {/* AVATAR (Apenas telas médias+) */}
              <Avatar className="hidden md:flex h-10 w-10">
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