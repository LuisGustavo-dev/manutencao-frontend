"use client"

import React from "react"
import { useRouter } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Ícones atualizados para o projeto Croissant
import {
    LogOut,
    ClipboardList,
    Warehouse,
    Home,
    Croissant,
    Factory,
    Users,
    User as UserIcon
} from "lucide-react"

import toast from "react-hot-toast"
import { useAuth } from "@/app/contexts/authContext"

// ✅ CONFIGURAÇÃO CORRIGIDA (com 'disabled: false')
const fullMenuConfig = [
    {
        label: "Produção",
        items: [
            { name: "Painel Principal", icon: Home, path: "/home", allowedRoles: ['gerente', 'producao', 'armazem', 'conferencia', 'expedicao', 'compras'], disabled: false },
            { name: "Produção Interna", icon: Croissant, path: "/home/croissant", allowedRoles: ['gerente', 'producao', 'armazem', 'conferencia', 'expedicao'], disabled: false },
            { name: "Produção Terceiros", icon: Factory, path: "/home/marcas-proprias", allowedRoles: ['gerente', 'producao', 'armazem', 'conferencia', 'expedicao'], disabled: false },
            { name: "Estoque de Insumos", icon: Warehouse, path: "/home/compras/estoque", allowedRoles: ['gerente', 'compras'] },
            { name: "Pedido de Insumos", icon: ClipboardList, path: "/home/compras/pedidos", allowedRoles: ['gerente', 'compras'] },
        ]
    },
    {
        label: "Administração",
        items: [
            { name: "Gerenciar Usuários", icon: Users, path: "/home/usuarios", allowedRoles: ['gerente'], disabled: false },
            { name: "Meu Perfil", icon: UserIcon, path: "/home/perfil", allowedRoles: ['gerente', 'producao', 'armazem', 'conferencia', 'expedicao', 'compras'], disabled: false },
        ]
    }
];

export default function Navbar() {
    const { logout, role, user } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        toast.success("Você saiu com sucesso!")
        router.replace("/login")
    }

    const currentRole = (role || "gerente").toLowerCase();
    const accessibleMenuGroups = fullMenuConfig
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.allowedRoles.includes(currentRole)),
        }))
        .filter(group => group.items.length > 0);

    const atalhos = [
        // Adicionando 'disabled: false' aqui também para consistência
        { name: "Sair", icon: LogOut, action: handleLogout, disabled: false }
    ];

    const handleItemClick = (item: any) => {
        if (item.disabled) {
            toast.error(`${item.name} em construção!`)
        } else if (item.action) {
            item.action()
        } else if (item.path) {
            router.push(item.path)
        }
    }

    const userName = user?.nome || "Usuário";
    const userEmail = user?.email || `Cargo: ${currentRole}`;
    const userFallback = userName.charAt(0).toUpperCase();

    const AvatarDropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                    <AvatarFallback className="bg-primary text-white">
                        {userFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {accessibleMenuGroups.map((group, groupIndex) => (
                    <React.Fragment key={group.label}>
                        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <DropdownMenuItem
                                    key={item.name}
                                    onClick={() => handleItemClick(item)}
                                    className={item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span>{item.name}</span>
                                </DropdownMenuItem>
                            );
                        })}
                        {groupIndex < accessibleMenuGroups.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                ))}
                <DropdownMenuSeparator />

                {atalhos.map((item) => {
                    const Icon = item.icon
                    return (
                        <DropdownMenuItem
                            key={item.name}
                            onClick={() => handleItemClick(item)}
                            className={item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.name}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="bg-card top-0 z-10 flex items-center justify-between h-16 border-b px-6">
            <div className="flex items-center gap-2">
                <img src='/assets/banner.png' alt='Logo Croissant' className='h-8 w-auto ml-2'/>
            </div>
            
            <div>
                {AvatarDropdown}
            </div>
        </div>
    )
}