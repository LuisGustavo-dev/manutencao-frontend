'use client';
import { useEffect, useState, useMemo } from 'react';
import { mockOrdensServico, mockEquipamentos, mockTecnicos } from '@/lib/mock-data';
import type { OrdemServico, Tecnico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext';

// Importa os NOVOS componentes
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
import { OsTabs } from './components/OsTabs';

// Tipo enriquecido que será usado nas tabelas
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
  tecnicoNome: string | null;
};

export default function OrdensServicoPage() {
  const { role } = useAuth(); 

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- 1. Enriquece os dados (useEffect) ---
  useEffect(() => {
    const enriched = mockOrdensServico.map((os) => ({
      ...os,
      equipamentoNome: mockEquipamentos.find(e => e.id === os.equipamentoId)?.nome || 'Não encontrado',
      tecnicoNome: mockTecnicos.find(t => t.id === os.tecnicoId)?.nome || null,
    }));
    
    // Filtra para o cliente
    if (role === 'Cliente') {
      // (Simulação de filtro por cliente)
      setAllOrdens(enriched.filter(os => os.clienteNome === 'Cliente A (Padaria)'));
    } else {
      setAllOrdens(enriched);
    }
  }, [role]); 

  // --- 2. Filtra a lista com base nos estados (useMemo) ---
  const filteredOrdens = useMemo(() => {
    return allOrdens.filter(os => {
      const searchMatch = searchTerm === '' ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tipoMatch = tipoFilter === 'todos' || os.tipo === tipoFilter;

      return searchMatch && tipoMatch;
    });
  }, [allOrdens, searchTerm, tipoFilter]);

  // --- 3. Separa as listas para as Abas ---
  const ordensPendentes = filteredOrdens.filter(os => os.status === 'Pendente');
  const ordensEmAndamento = filteredOrdens.filter(os => os.status === 'Em Andamento');
  const ordensConcluidas = filteredOrdens.filter(os => os.status === 'Concluída');

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <OsPageHeader role={role} />

      {/* 2. CARDS KPI */}
      <OsKpiCards 
        pendentes={ordensPendentes.length}
        emAndamento={ordensEmAndamento.length}
        concluidas={ordensConcluidas.length} // (Poderia ser um cálculo de 30 dias)
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
        pendentes={ordensPendentes}
        emAndamento={ordensEmAndamento}
        concluidas={ordensConcluidas}
        role={role}
        tecnicos={mockTecnicos} // <-- Passa a lista de técnicos para o modal
      />
    </div>
  );
}