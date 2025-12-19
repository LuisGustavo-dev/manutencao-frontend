"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/authContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail, // Adicionado para melhor UX de redimensionamento (opcional)
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  Wrench,
  Package,
  Home,
  Users,
  User as UserIcon,
  ShieldCheck,
  Settings,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

// --- TIPAGEM ---
type Role = "Manutentor" | "Admin" | string;

interface MenuItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
  allowedRoles: string[];
  disabled?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

// --- CONFIGURAÇÃO ---
const fullMenuConfig: MenuGroup[] = [
  {
    label: "Ponto",
    items: [
      {
        name: "Ponto de Entrada",
        icon: Home,
        path: "/dashboard/manutentor",
        allowedRoles: ["Manutentor", "Admin"],
      },
    ],
  },
  {
    label: "Gestão Operacional",
    items: [
      {
        name: "Equipamentos",
        icon: Package,
        path: "/dashboard/manutentor/equipamentos",
        allowedRoles: ["Manutentor", "Admin"],
      },
      {
        name: "Agenda",
        icon: Users,
        path: "/dashboard/manutentor/agenda",
        allowedRoles: ["Manutentor", "Admin"],
      },
    ],
  },
  {
    label: "Administrativo",
    items: [
      {
        name: "Visão Geral",
        icon: ShieldCheck,
        path: "/dashboard/manutentor/visao-geral",
        allowedRoles: ["Manutentor", "Admin"],
      },
      {
        name: "Histórico",
        icon: UserIcon,
        path: "/dashboard/manutentor/historico",
        allowedRoles: ["Manutentor", "Admin"],
      },
      {
        name: "Reembolso",
        icon: CreditCard, // Ícone mais apropriado
        path: "/dashboard/manutentor/reembolso",
        allowedRoles: ["Manutentor", "Admin"],
      },
    ],
  },
];

export default function ManutentorSidebar({
  collapsed,
  setCollapsed,
}: AppSidebarProps) {
  const { role, logout, user } = useAuth();
  const pathname = usePathname();

  const currentRole = role || "Manutentor";

  // UseMemo evita recalcular o filtro a cada render
  const accessibleMenuGroups = useMemo(() => {
    return fullMenuConfig
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.allowedRoles.includes(currentRole)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [currentRole]);

  const handleLogout = () => {
    logout();
    toast.success("Você saiu com sucesso!");
  };

  const userName = user?.nome || "Usuário";
  const userEmail = user?.email || "técnico@grandtech.com";
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Função auxiliar para verificar rota ativa
  const checkIsActive = (targetPath?: string) => {
    if (!targetPath) return false;
    // Exato ou sub-rota (evita ativar a Home '/' em todas as rotas)
    if (targetPath === "/dashboard/manutentor" && pathname !== targetPath)
      return false;
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  return (
    <Sidebar
      collapsible="icon" // Uso da prop nativa se sua versão do shadcn suportar
      className={`bg-card border-r h-full transition-all duration-300 ${
        collapsed ? "w-[70px]" : "w-64"
      }`}
    >
      {/* --- HEADER --- */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-2">
        <SidebarMenuButton
          size="lg"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          {!collapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
              <span className="truncate font-bold">GrandTech</span>
              <span className="truncate text-xs text-muted-foreground">
                Painel do Técnico
              </span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarHeader>

      {/* --- CONTENT --- */}
      <SidebarContent className="gap-0">
        {accessibleMenuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="px-4 py-2 text-xs uppercase text-muted-foreground/70 font-bold">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = checkIsActive(item.path);

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={collapsed ? item.name : undefined} // Tooltip nativo do shadcn
                        className="my-1"
                        disabled={item.disabled}
                      >
                        {item.action ? (
                          // Botão de Ação (sem Link)
                          <button onClick={item.action} className="w-full">
                            <item.icon />
                            <span>{item.name}</span>
                          </button>
                        ) : (
                          // Link de Navegação (Next.js Link)
                          <Link href={item.path!}>
                            <item.icon />
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* --- FOOTER --- */}
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={collapsed ? "right" : "top"} // Abre para o lado se colapsado
                align="end"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate w-40">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
