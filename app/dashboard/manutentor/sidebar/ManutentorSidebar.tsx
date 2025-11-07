"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/authContext" 
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar" 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Wrench, Package, Home, Users, User as UserIcon, Loader2, ShieldCheck } from "lucide-react" 
import toast from "react-hot-toast"

interface AppSidebarProps {
    collapsed: boolean
    setCollapsed: (value: boolean) => void
}

// Configuração de menu SÓ do manutentor
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
        ]
    },
];

export default function ManutentorSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
    const { role, logout, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname();
    const [loadingPath, setLoadingPath] = useState<string | null>(null);

    const currentRole = role || "Manutentor"; 

    useEffect(() => { if (loadingPath) setLoadingPath(null); }, [pathname, loadingPath]);

    const accessibleMenuGroups = fullMenuConfig
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
        }))
        .filter(group => group.items.length > 0);
    
    const handleLogout = () => { logout(); toast.success("Você saiu com sucesso!"); };
    
    const handleClick = (item: any) => {
        // A lógica de path é movida para as funções 'render'
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
    const userEmail = user?.email || "Técnico";
    const userFallback = userName.charAt(0).toUpperCase();

    // --- FUNÇÃO renderMenuItem (CORRIGIDA) ---
    const renderMenuItem = (item: any) => {
        const Icon = item.icon
        const targetPath = item.path; // item.path PODE ser undefined
        
        // (A lógica de simulação não é necessária aqui, mas a verificação de 'targetPath' é)
        
        const isActive = pathname === targetPath;
        const isLoading = loadingPath === targetPath; 

        return (
            <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                    onClick={() => handleClick(item)} // Passa o item original
                    className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""} ${isActive ? "bg-primary hover:bg-primary/90 text-white hover:text-white cursor-default" : "hover:bg-gray-100 dark:hover:bg-gray-700"} ${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${isLoading ? "cursor-wait opacity-70" : ""} `}
                    disabled={isLoading || item.disabled} 
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    {!collapsed && <span>{item.name}</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    };

    // --- FUNÇÃO renderDropdownItem (CORRIGIDA) ---
    const renderDropdownItem = (item: any) => {
        const Icon = item.icon;
        const targetPath = item.path; // item.path PODE ser undefined (ex: "Sair")
        
        // --- INÍCIO DA CORREÇÃO ---
        // (A verificação 'if (targetPath) {}' não é necessária
        // porque não estamos mudando o path, mas 'targetPath' ainda é usado)
        // --- FIM DA CORREÇÃO ---
        
        const isLoading = loadingPath === targetPath;
        const isActive = pathname === targetPath;

        return (
            <DropdownMenuItem
                key={item.name}
                onClick={() => handleClick(item)} // Passa o item original
                className={`${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${isLoading ? "cursor-wait opacity-70" : ""} ${isActive ? "bg-primary/10 text-primary cursor-default" : ""} `}
                disabled={isLoading || item.disabled}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
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
                    <ShieldCheck className='h-8 w-8 text-primary ml-2'/>
                    {!collapsed && (
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">GrandTech</span>
                            <span className="truncate text-xs text-muted-foreground">Painel do Técnico</span>
                        </div>
                    )}
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent className="bg-card flex-1 transition-all duration-300">
                {/* O Manutentor NÃO VÊ o seletor de simulação */}
                
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
                            )}
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}