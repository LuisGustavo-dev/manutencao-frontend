'use client';
import { useEffect, useState, useMemo } from 'react';
import { mockOrdensServico, mockEquipamentos } from '@/lib/mock-data';
import type { OrdemServico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext'; // <-- Importa o hook

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
import { OsTabs } from './components/OsTabs';

// Adicionamos 'export'
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
};

export default function ClienteOrdensServicoPage() {
  const { role, user } = useAuth(); // <-- Pega o usuário logado

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- 1. Enriquece os dados (useEffect) ---
  useEffect(() => {
    // Aguarda o usuário ser carregado pelo contexto
    if (!user) return; 

    const enriched = mockOrdensServico.map((os) => ({
      ...os,
      equipamentoNome: mockEquipamentos.find(e => e.id === os.equipamentoId)?.nome || 'Não encontrado',
    }));
    
    // --- CORREÇÃO DINÂMICA ---
    // Agora o filtro usa o 'clienteId' do usuário logado
    if (role === 'Cliente') {
      // user.clienteId (ex: 'cli-1')
      setAllOrdens(enriched.filter(os => os.clienteId === user.clienteId));
    } else {
      // (Admin simulando vê todas)
      setAllOrdens(enriched);
    }
    // Roda sempre que o usuário (ou a simulação) mudar
  }, [role, user]);

  // --- 2. Filtra a lista com base nos estados (useMemo) ---
  const filteredOrdens = useMemo(() => {
    return allOrdens.filter(os => {
      const searchMatch = searchTerm === '' ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tipoMatch = tipoFilter === 'todos' || os.tipo === tipoFilter;

      return searchMatch && tipoMatch;
    });
  }, [allOrdens, searchTerm, tipoFilter]);

  // --- 3. Separa as listas para as Abas ---
  const pendentes = filteredOrdens.filter(os => os.status === 'Pendente');
  const emAndamento = filteredOrdens.filter(os => os.status === 'Em Andamento');
  const concluidas = filteredOrdens.filter(os => os.status === 'Concluída');

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <OsPageHeader />

      {/* 2. CARDS KPI */}
      <OsKpiCards 
        pendentes={pendentes.length}
        emAndamento={emAndamento.length}
        concluidas={concluidas.length}
      />

      {/* 3. BARRA DE FILTRO E PESQUISA */}
      <OsFilterBar
        searchTerm={searchTerm}
        tipoFilter={tipoFilter}
        onSearchChange={setSearchTerm}
        onTipoChange={setTipoFilter}
      />

      {/* 4. ABAS E TABELAS */}
      <OsTabs
        pendentes={pendentes}
        emAndamento={emAndamento}
        concluidas={concluidas}
        role={role}
      />
    </div>
  );
}