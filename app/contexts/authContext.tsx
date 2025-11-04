'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
// Importa os dados e o tipo do seu mock
import { mockUsuarios } from '@/lib/mock-data';
import type { Usuario } from '@/lib/mock-data'; // <-- Usa o tipo 'Usuario'

interface AuthContextType {
  token: string | null | undefined; // undefined = carregando
  user: Usuario | null; // <-- Usa o tipo 'Usuario' completo
  role: string | null;
  setRole: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined); 
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole) {
      // Carrega o usuário completo baseado na role salva
      const foundUser = mockUsuarios.find(u => u.role === storedRole);
      if (foundUser) {
        setToken(storedRole);
        setUser(foundUser); // <-- Salva o usuário completo (com .nome, .email, .clienteId)
      } else {
        setToken(null); 
      }
    } else {
      setToken(null); 
    }
  }, []);

  const setRole = (newRole: string) => {
    // Encontra o usuário no mock com base na role
    const foundUser = mockUsuarios.find(u => u.role === newRole);
    if (foundUser) {
      localStorage.setItem('user_role', newRole);
      setToken(newRole);
      setUser(foundUser); // <-- Salva o usuário completo
    }
  };

  const logout = () => {
    localStorage.removeItem('user_role');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const role = typeof token === 'string' ? token : null;

  return (
    <AuthContext.Provider value={{ token, user, role, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};