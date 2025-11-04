"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/authContext" 

// Seus componentes customizados
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar" 
// Componentes Shadcn
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Ícones
import { LogOut, Wrench, Package, Home, Users, User as UserIcon, Loader2, ShieldCheck, Settings } from "lucide-react" 
import toast from "react-hot-toast"

interface AppSidebarProps {
    collapsed: boolean
    setCollapsed: (value: boolean) => void
}

// Configuração do menu (sem alteração)
const fullMenuConfig = [
    // ... (seu config de menu completo)
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
            { name: "Ordens de Serviço", icon: Wrench, path: "/dashboard/admin/ordens-servico", allowedRoles: ['Admin', 'Manutentor', 'Cliente'] },
            { name: "Equipamentos", icon: Package, path: "/dashboard/admin/equipamentos", allowedRoles: ['Admin', 'Manutentor', 'Cliente'] },
            { name: "Clientes", icon: Users, path: "/dashboard/admin/clientes", allowedRoles: ['Admin', 'Manutentor'] },
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

export default function AdminSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
    const { role, setRole, logout, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname();
    const [loadingPath, setLoadingPath] = useState<string | null>(null); // <-- O estado de loading

    const loggedInRole = useAuth().role; 
    const currentRole = role || "Admin"; 

    // --- LÓGICA DE LOADING (UseEffect) ---
    // Limpa o loader DEPOIS que a navegação terminar (pathname mudar)
    useEffect(() => { 
        if (loadingPath) setLoadingPath(null); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // <-- O ESLint vai reclamar, mas queremos que rode SÓ com o pathname

    const accessibleMenuGroups = fullMenuConfig
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
        }))
        .filter(group => group.items.length > 0);

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        toast.success(`Simulando: ${newRole}`);
        router.push('/dashboard'); 
    };

    const handleLogout = () => { logout(); toast.success("Você saiu com sucesso!"); };
    
    // --- LÓGICA DE LOADING (handleClick) ---
    const handleClick = (item: any) => {
        if (item.disabled) {
            toast.error(`${item.name} em construção!`);
        } else if (item.action) {
            item.action();
        } else if (item.path) { 
            // Não faz nada se já estiver carregando ou na página
            if (item.path === pathname || loadingPath === item.path) return;
            
            // 1. ATIVA O LOADER IMEDIATAMENTE
            setLoadingPath(item.path); 
            // 2. INICIA A NAVEGAÇÃO
            router.push(item.path); 
        }
    };

    const atalhos = [{ name: "Sair", icon: LogOut, action: handleLogout }];
    
    // Dados do Perfil
    const userName = user?.nome || "Usuário";
    const roleDisplayName = availableRoles.find(r => r.id === currentRole)?.nome.replace(" (Simular)", "") || currentRole;
    const userEmail = user?.email || `Cargo: ${roleDisplayName}`;
    const userFallback = userName.charAt(0).toUpperCase();

    // --- FUNÇÃO renderMenuItem (COM LOADING) ---
    const renderMenuItem = (item: any) => {
        const Icon = item.icon
        let targetPath = item.path; 

        if (targetPath) {
            if (currentRole !== 'Admin' && !targetPath.startsWith('/dashboard/admin')) {
                targetPath = targetPath.replace('/dashboard/', `/dashboard/${currentRole.toLowerCase()}/`);
            }
        }

        const isActive = pathname === targetPath;
        const isLoading = loadingPath === targetPath; // <-- Verifica se é este item que está carregando

        return (
            <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                    onClick={() => handleClick({...item, path: targetPath})}
                    // Adiciona classes de loading
                    className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""} 
                               ${isActive ? "bg-primary hover:bg-primary/90 text-white hover:text-white cursor-default" : "hover:bg-gray-100 dark:hover:bg-gray-700"} 
                               ${item.disabled ? "cursor-not-allowed opacity-50" : ""} 
                               ${isLoading ? "cursor-wait opacity-70" : ""} `} // <-- Classe de loading
                    disabled={isLoading || item.disabled} // <-- Desabilita enquanto carrega
                >
                    {/* Mostra o Loader2 se isLoading for true */}
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    {!collapsed && <span>{item.name}</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    };

    // --- FUNÇÃO renderDropdownItem (COM LOADING) ---
    const renderDropdownItem = (item: any) => {
        const Icon = item.icon;
        let targetPath = item.path;

        if (targetPath) {
            if (currentRole !== 'Admin' && !targetPath.startsWith('/dashboard/admin')) {
                targetPath = targetPath.replace('/dashboard/', `/dashboard/${currentRole.toLowerCase()}/`);
            }
        }
        
        const isLoading = loadingPath === targetPath; // <-- Verifica o loading
        const isActive = pathname === targetPath;

        return (
            <DropdownMenuItem
                key={item.name}
                onClick={() => handleClick({...item, path: targetPath})}
                // Adiciona classes de loading
                className={`${item.disabled ? "cursor-not-allowed opacity-50" : ""} 
                           ${isLoading ? "cursor-wait opacity-70" : ""} 
                           ${isActive ? "bg-primary/10 text-primary cursor-default" : ""} `}
                disabled={isLoading || item.disabled} // <-- Desabilita enquanto carrega
            >
                {/* Mostra o Loader2 se isLoading for true */}
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
                            <span className="truncate text-xs text-muted-foreground">Painel do Admin</span>
                        </div>
                    )}
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent className="bg-card flex-1 transition-all duration-300">
                {loggedInRole === 'Admin' && !collapsed && (
                    <div className="p-4 border-b">
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Simular Função</label>
                        <Select value={currentRole} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Selecione a função" /></SelectTrigger>
                            <SelectContent>
                                {availableRoles.map(r => (<SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

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