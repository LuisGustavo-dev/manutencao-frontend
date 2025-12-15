'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Usuario } from '@/lib/mock-data'; // Continua usando o tipo

type AppRole = 'Admin' | 'Manutentor' | 'Cliente' | 'Colaborador';

const mapApiRoleToAppRole = (apiRole: string): AppRole => {
  const role = apiRole.toLowerCase();
  if (role === 'admin') return 'Admin';
  if (role === 'technical') return 'Manutentor';
  if (role === 'collaborator') return 'Colaborador'; // Novo mapeamento
  return 'Cliente'; 
};

interface AuthContextType {
  token: string | null;
  user: Usuario | null;
  role: AppRole | null; // <-- Tipo mais forte
  login: (data: { user: Usuario, accessToken: string }) => void; // <-- Nova função de login
  logout: () => void;
  isLoading: boolean; // <-- Estado de carregamento
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando
  const router = useRouter();

  // --- EFEITO DE VERIFICAÇÃO DE TOKEN (AO CARREGAR O SITE) ---
  useEffect(() => {
    const verifyToken = async () => {
      // 1. Pega o token do localStorage
      const storedToken = localStorage.getItem('accessToken');
      
      if (storedToken) {
        try {
          // 2. Tenta buscar os dados do usuário com o token
          const response = await fetch('http://localhost:3340/user/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Token inválido ou expirado');
          }

          // 3. Sucesso: Define o usuário e o token no estado
          const userData = await response.json(); 
          setToken(storedToken);
          setUser(userData); 
          
        } catch (error) {
          // 4. Falha: Limpa o token inválido
          console.error(error);
          localStorage.removeItem('accessToken');
          setToken(null);
          setUser(null);
        }
      } else {
        // 5. Ninguém logado
        setToken(null);
        setUser(null);
      }
      setIsLoading(false); // Terminou a verificação
    };

    verifyToken();
  }, []); // Roda apenas uma vez

  // --- FUNÇÃO DE LOGIN (Chamada pela LoginPage) ---
  // A LoginPage faz o fetch, este context apenas SALVA o resultado
  const login = (data: { user: Usuario, accessToken: string }) => {
    localStorage.setItem('accessToken', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    // O redirecionamento é feito pela própria LoginPage
  };

  // --- FUNÇÃO DE LOGOUT (Atualizada) ---
  const logout = () => {
    localStorage.removeItem('accessToken'); // <-- Remove o 'accessToken'
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // --- ROLE (Derivada do usuário) ---
  const role = user ? mapApiRoleToAppRole(user.role) : null;

  // Mostra uma tela em branco (ou um spinner) enquanto valida o token
  if (isLoading) {
    return null; // ou <SpinnerFullScreen />
  }

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout, isLoading }}>
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