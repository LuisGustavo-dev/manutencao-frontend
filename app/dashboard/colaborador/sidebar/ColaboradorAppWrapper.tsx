"use client"

import { useEffect, useState, ReactNode } from "react"
import ColaboradorNavbar from "./ColaboradorNavbar" // Navbar criada anteriormente
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/app/contexts/authContext"
import React from "react"

interface AppWrapperProps {
  children: ReactNode;
  sidebar: ReactNode; // A sidebar será injetada aqui
}

export function ColaboradorAppWrapper({ children, sidebar }: AppWrapperProps) {
    const { token } = useAuth()
    const [collapsed, setCollapsed] = useState(false)

    // Lógica de responsividade automática
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
                <span className="text-sm text-gray-500">Carregando ambiente...</span>
            </div>
        )
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-900">
                {/* Sidebar Desktop */}
                <div
                    className={`hidden md:flex flex-shrink-0 transition-all duration-300 border-r bg-card ${
                        collapsed ? "w-16" : "w-64"
                    }`}
                >
                    {/* Clona o elemento sidebar passando as props de controle */}
                    {React.cloneElement(sidebar as React.ReactElement<any>, { collapsed, setCollapsed })}
                </div>

                {/* Sidebar Mobile (Overlay) */}
                <div
                    className={`fixed inset-0 z-50 md:hidden ${
                        collapsed ? "hidden" : "flex"
                    }`}
                >
                    {/* No mobile, a sidebar sempre abre expandida */}
                    <div className="w-64 h-full bg-card shadow-xl">
                        {React.cloneElement(sidebar as React.ReactElement<any>, { collapsed: false, setCollapsed })}
                    </div>
                    {/* Clicar fora fecha a sidebar */}
                    <div
                        className="flex-1 bg-black/40 backdrop-blur-sm"
                        onClick={() => setCollapsed(true)} 
                    />
                </div>

                {/* Área de Conteúdo Principal */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <ColaboradorNavbar />
                    <main className="flex-1 overflow-auto w-full p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}