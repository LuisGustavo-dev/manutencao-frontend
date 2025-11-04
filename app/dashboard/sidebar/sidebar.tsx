"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/authContext" // Usa o contexto do GrandTech

// Seus componentes customizados de sidebar
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar" 
// Componentes Shadcn
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// ÍCONES ATUALIZADOS para o GrandTech
import { LogOut, Wrench, Package, Home, Users, User as UserIcon, Loader2, ShieldCheck, Settings } from "lucide-react" 
import toast from "react-hot-toast"

interface AppSidebarProps {
    collapsed: boolean
    setCollapsed: (value: boolean) => void
}

// --- 1. CONFIGURAÇÃO DO MENU ATUALIZADA ---
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
            // Adicionado o perfil (que estava no seu original) para todos
            { name: "Meu Perfil", icon: UserIcon, path: "/dashboard/perfil", allowedRoles: ['Admin', 'Manutentor', 'Cliente'] },
        ]
    }
];

// --- 2. ROLES ATUALIZADAS ---
const availableRoles = [
    { id: 'Admin', nome: 'Admin (Simular)' },
    { id: 'Manutentor', nome: 'Manutentor (Simular)' },
    { id: 'Cliente', nome: 'Cliente (Simular)' },
];

export function AppSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
    const { role, setRole, logout, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname();

    const [loadingPath, setLoadingPath] = useState<string | null>(null);

    useEffect(() => {
        if (loadingPath) {
            setLoadingPath(null);
        }
    }, [pathname, loadingPath]); // Adicionado loadingPath para evitar warning

    // O 'role' aqui é a role "ativa" (que pode ser a simulada)
    // Se não houver role, assume 'Cliente' como padrão
    const currentRole = role || "Cliente"; 

    const accessibleMenuGroups = fullMenuConfig
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
        }))
        .filter(group => group.items.length > 0);

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        const roleName = availableRoles.find(r => r.id === newRole)?.nome || newRole;
        toast.success(`Simulando: ${roleName}`);
        router.push('/dashboard'); // <-- ATUALIZADO (usa nosso redirecionador)
    };

    const handleLogout = () => {
        logout()
        toast.success("Você saiu com sucesso!")
        // router.push("/login") // <-- Removido (logout() já faz isso)
    };

    const handleClick = (item: any) => {
        if (item.path === pathname || loadingPath) return;

        if (item.disabled) {
            toast.error(`${item.name} em construção!`)
        } else if (item.action) {
            item.action()
        } else if (item.path) {
            setLoadingPath(item.path);
            router.push(item.path)
        }
    };

    const atalhos = [{ name: "Sair", icon: LogOut, action: handleLogout }];

    // Esta lógica agora funciona com o 'user' do authContext
    const userName = user?.nome || "Usuário";
    const roleDisplayName = availableRoles.find(r => r.id === currentRole)?.nome.replace(" (Simular)", "") || currentRole;
    const userEmail = user?.email || `Cargo: ${roleDisplayName}`;
    const userFallback = userName.charAt(0).toUpperCase();

    // renderMenuItem (Nenhuma alteração necessária)
    const renderMenuItem = (item: any) => {
        const Icon = item.icon
        const isActive = pathname === item.path;
        const isLoading = loadingPath === item.path; 

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

    // renderDropdownItem (Nenhuma alteração necessária)
    const renderDropdownItem = (item: any) => {
        const Icon = item.icon;
        const isLoading = loadingPath === item.path;
        const isActive = pathname === item.path;

        return (
            <DropdownMenuItem
                key={item.name}
                onClick={() => handleClick(item)}
                className={`${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${isLoading ? "cursor-wait opacity-70" : ""} ${isActive ? "bg-primary hover:bg-primary/90 text-white hover:text-white cursor-default" : ""} `}
                disabled={isLoading || item.disabled}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
                {item.name}
            </DropdownMenuItem>
        );
    };

    return (
        <Sidebar className={`bg-card h-full flex flex-col justify-between transition-all duration-300 ${collapsed ? "w-16" : "w-64"} hidden md:flex`}>
            
            {/* --- 3. HEADER ATUALIZADO --- */}
            <SidebarHeader className={`bg-card flex items-center p-2 transition-all duration-300 ${collapsed ? "justify-center items-center" : "justify-between"}`}>
                <SidebarMenuButton
                    size="lg"
                    onClick={() => setCollapsed(!collapsed)}
                    className="cursor-pointer flex items-center justify-center gap-2"
                >
                    {/* Imagem do logo trocada por ícone */}
                    <ShieldCheck className='h-8 w-8 text-primary ml-2'/>
                    {!collapsed && (
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">GrandTech</span>
                            <span className="truncate text-xs text-muted-foreground">Gestão de Man.</span>
                        </div>
                    )}
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarContent className="bg-card flex-1 transition-all duration-300">
                {/* --- 4. SELETOR DE ROLE MANTIDO (PARA TESTES) --- */}
                {/* Removemos a lógica de `loggedInRole` para que o seletor apareça para todos */}
                {!collapsed && (
                    <div className="p-4 border-b">
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                            Simular Função
                        </label>
                        <Select value={currentRole} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRoles.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Renderização do Menu (Nenhuma alteração) */}
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

            {/* Rodapé com Menu de Perfil (Nenhuma alteração) */}
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