'use client';
import { useState, useEffect } from 'react';

// Um "hook" simples para ler a role do localStorage
export const useAuthRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Garante que só rode no navegador
    const storedRole = localStorage.getItem('user_role');
    setRole(storedRole);
  }, []);

  return role;
};

// Funções de login/logout
export const authService = {
  login: (role: string) => {
    localStorage.setItem('user_role', role);
  },
  logout: () => {
    localStorage.removeItem('user_role');
  },
};