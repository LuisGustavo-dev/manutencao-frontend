"use client"

import { useEffect, useState, ReactNode, useContext } from "react"
import Navbar from "./navbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar"
import { useAuth } from "@/app/contexts/authContext"

interface AppWrapperProps {
    children: ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
    const { token } = useAuth() // 🚀 Não precisamos mais da 'role' aqui
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true)
            }
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    if (token === undefined) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="text-sm text-gray-500">Carregando...</span>
            </div>
        )
    }

    // 🚀 LÓGICA ATUALIZADA:
    // A sidebar agora é exibida se o usuário simplesmente tiver um token (estiver logado).
    // A conversão `!!token` garante que o valor seja um booleano (true/false).
    const shouldShowSidebar = !!token;

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen">
                {shouldShowSidebar ? (
                    <>
                        {/* Sidebar desktop */}
                        <div
                            className={`hidden md:flex flex-shrink-0 transition-all duration-300 ${
                                collapsed ? "w-16" : "w-64"
                            }`}
                        >
                            <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                        </div>

                        {/* Sidebar mobile */}
                        <div
                            className={`fixed inset-0 z-50 md:hidden ${
                                collapsed ? "hidden" : "flex"
                            }`}
                        >
                            <AppSidebar collapsed={false} setCollapsed={setCollapsed} />
                            <div
                                className="flex-1 bg-black/40"
                                onClick={() => setCollapsed(true)}
                            />
                        </div>

                        {/* Área principal */}
                        <div className="flex-1 flex flex-col">
                            <Navbar />
                            <main className="flex-1 overflow-auto w-full p-2">{children}</main>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <Navbar />
                        <main className="flex-1 overflow-auto w-full">{children}</main>
                    </div>
                )}
            </div>
        </SidebarProvider>
    )
}