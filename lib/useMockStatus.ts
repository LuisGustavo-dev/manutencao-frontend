'use client';
import { useState, useEffect } from 'react';
import { mockEquipamentos } from './mock-data';

// Hook para pegar o status "real" (checa localStorage primeiro)
export const useEquipmentStatus = (equipamentoId: string | null) => {
  const [status, setStatus] = useState<'Disponível' | 'EmManutencao' | null>(null);

  useEffect(() => {
    if (!equipamentoId) return;

    // 1. O status no localStorage é o "correto"
    const storedStatus = localStorage.getItem(`status_${equipamentoId}`) as any;

    if (storedStatus) {
      setStatus(storedStatus);
    } else {
      // 2. Se não houver, usa o do "banco de dados"
      const eq = mockEquipamentos.find(e => e.id === equipamentoId);
      if (eq) {
        setStatus(eq.statusManutencao);
      }
    }
  }, [equipamentoId]);

  // Função para o componente atualizar o status
  const updateStatus = (newStatus: 'Disponível' | 'EmManutencao') => {
    if (equipamentoId) {
      localStorage.setItem(`status_${equipamentoId}`, newStatus);
      setStatus(newStatus);
    }
  };

  return { status, updateStatus };
};