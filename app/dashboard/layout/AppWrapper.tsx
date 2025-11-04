"use client"

import { useEffect, useState, ReactNode } from "react"
import Navbar from "./Navbar" // Importa a Navbar compartilhada
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/app/contexts/authContext"
import React from "react"

interface AppWrapperProps {
  children: ReactNode;
  // 1. A sidebar agora é passada como uma prop
  sidebar: ReactNode; 
}

export function AppWrapper({ children, sidebar }: AppWrapperProps) {
    const { token } = useAuth()
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setCollapsed(true);
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

    // 2. A lógica "shouldShowSidebar" não é mais necessária aqui,
    // pois o gatekeeper do layout (admin, manutentor, etc.) já validou o token.

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen">
                {/* Sidebar desktop */}
                <div
                    className={`hidden md:flex flex-shrink-0 transition-all duration-300 ${
                        collapsed ? "w-16" : "w-64"
                    }`}
                >
                    {/* 3. Renderiza a sidebar que foi passada como prop */}
                    {React.cloneElement(sidebar as React.ReactElement<any>, { collapsed, setCollapsed })}
                </div>

                {/* Sidebar mobile */}
                <div
                    className={`fixed inset-0 z-50 md:hidden ${
                        collapsed ? "hidden" : "flex"
                    }`}
                >
                    {React.cloneElement(sidebar as React.ReactElement<any>, { collapsed: false, setCollapsed })}
                    <div
                        className="flex-1 bg-black/40"
                        onClick={() => setCollapsed(true)} 
                    />
                </div>

                {/* Área principal (Logado) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar /> {/* Renderiza a Navbar superior compartilhada */}
                    <main className="flex-1 overflow-auto w-full p-2 md:p-6">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    )
}