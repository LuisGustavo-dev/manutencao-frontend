"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/authContext" 

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar" 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// --- ÍCONES NOVOS IMPORTADOS ---
import { 
    LogOut, Clock, Loader2, Home, 
    CalendarDays, DollarSign, History, User 
} from "lucide-react" 
import toast from "react-hot-toast"

interface AppSidebarProps {
    collapsed: boolean
    setCollapsed: (value: boolean) => void
}

// --- CONFIGURAÇÃO DE MENU DO COLABORADOR ATUALIZADA ---
const colaboradorMenuConfig = [
    {
        label: "Dia a Dia",
        items: [
            { name: "Registrar Ponto", icon: Clock, path: "/dashboard/colaborador" }, // Dashboard principal
            { name: "Minha Agenda", icon: CalendarDays, path: "/dashboard/colaborador/agenda" },
        ]
    },
    {
        label: "Gestão Pessoal",
        items: [
            { name: "Histórico de Ponto", icon: History, path: "/dashboard/colaborador/historico" },
            { name: "Reembolsos", icon: DollarSign, path: "/dashboard/colaborador/reembolso" },
            { name: "Meu Perfil", icon: User, path: "/dashboard/colaborador/perfil" },
        ]
    },
];

export default function ColaboradorSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
    const { logout, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname();
    const [loadingPath, setLoadingPath] = useState<string | null>(null);

    useEffect(() => { 
        if (loadingPath) setLoadingPath(null); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const accessibleMenuGroups = colaboradorMenuConfig;

    const handleLogout = () => { logout(); toast.success("Até logo!"); };
    
    const handleClick = (item: any) => {
        if (item.disabled) {
            toast.error(`${item.name} em construção!`);
        } else if (item.action) {
            item.action();
        } else if (item.path) { 
            if (item.path === pathname || loadingPath === item.path) return;
            setLoadingPath(item.path); 
            router.push(item.path); 
        }
    };

    const atalhos = [{ name: "Sair", icon: LogOut, action: handleLogout }];
    
    const userName = user?.nome || "Colaborador";
    const userEmail = user?.email || "colaborador@mgr.com"; 
    const userFallback = userName.charAt(0).toUpperCase();

    const renderMenuItem = (item: any) => {
        const Icon = item.icon;
        const targetPath = item.path; 
        
        const isActive = pathname === targetPath;
        const isLoading = loadingPath === targetPath; 

        return (
            <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                    onClick={() => handleClick(item)}
                    className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""} ${isActive ? "bg-primary hover:bg-primary/90 text-white hover:text-white cursor-default" : "hover:bg-gray-100 dark:hover:bg-gray-700"} ${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${isLoading ? "cursor-wait opacity-70" : ""} `}
                    disabled={isLoading || item.disabled} 
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    {!collapsed && <span>{item.name}</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    };

    const renderDropdownItem = (item: any) => {
        const Icon = item.icon;
        const targetPath = item.path; 
        const isActive = pathname === targetPath;

        return (
            <DropdownMenuItem
                key={item.name}
                onClick={() => handleClick(item)}
                className={`${isActive ? "bg-primary/10 text-primary" : ""}`}
            >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
            </DropdownMenuItem>
        );
    };

    return (
        <Sidebar className={`bg-card h-full flex flex-col justify-between transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
            
            <SidebarHeader className={`bg-card flex items-center p-2 transition-all duration-300 ${collapsed ? "justify-center items-center" : "justify-between"}`}>
                <SidebarMenuButton
                    size="lg"
                    onClick={() => setCollapsed(!collapsed)}
                    className="cursor-pointer flex items-center justify-center gap-2"
                >
                    <img src="/assets/logo.png" alt="MGR Logo" className="h-8 w-8 object-contain" />
                    {!collapsed && (
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">MGR Refrigeração</span>
                            <span className="truncate text-xs text-muted-foreground">Área do Colaborador</span>
                        </div>
                    )}
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent className="bg-card flex-1 transition-all duration-300">
                {accessibleMenuGroups.map(({ label, items }) => (
                    <SidebarGroup key={label}>
                        {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map(renderMenuItem)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className={`bg-card p-2 transition-all duration-300 ${collapsed ? "flex justify-center" : ""}`}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className={`gap-2 flex items-center ${collapsed ? "justify-center" : ""}`}>
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-primary text-white">{userFallback}</AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{userName}</span>
                                            <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                                        </div>
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            {!collapsed && (
                                <DropdownMenuContent side="top" align="start" sideOffset={4} className="min-w-[200px] rounded-lg">
                                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {atalhos.map(renderDropdownItem)}
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}