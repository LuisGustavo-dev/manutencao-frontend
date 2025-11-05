import { Users, Building, Package, Wrench, HardHat, AlertTriangle } from "lucide-react";

// --- Tipos de Dados ---
export type Kpi = {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
};

export type ChartData = {
  name: string;
  [key: string]: string | number;
};

export type Technician = {
  id: string;
  nome: string;
  avatar: string;
  concluidas: number;
  taxa: string;
  emAndamento: number;
};

// --- Mocks ---
export const kpiData: Kpi[] = [
  { title: "Total de Clientes Ativos", value: "12", icon: Building, color: "text-green-600" },
  { title: "Equipamentos Monitorados", value: "178", icon: Package, color: "text-gray-500" },
  { title: "Total de Técnicos", value: "8", icon: HardHat, color: "text-blue-500" },
  { title: "OS Pendentes (Urgente)", value: "7", icon: AlertTriangle, color: "text-destructive" },
];

export const equipmentTypeChartData: ChartData[] = [
  { name: 'Túnel Congel.', os: 25 },
  { name: 'Câmara Cong.', os: 40 },
  { name: 'Câmara Resf.', os: 30 },
  { name: 'Girofreezer', os: 10 },
  { name: 'Máquina Gelo', os: 15 },
  { name: 'Climatização', os: 8 },
];

export const osTrendData: ChartData[] = [
  { name: 'Mai', Corretivas: 25, Preventivas: 10 },
  { name: 'Jun', Corretivas: 30, Preventivas: 12 },
  { name: 'Jul', Corretivas: 22, Preventivas: 15 },
  { name: 'Ago', Corretivas: 30, Preventivas: 15 },
  { name: 'Set', Corretivas: 25, Preventivas: 20 },
  { name: 'Out', Corretivas: 18, Preventivas: 25 },
];

export const technicianData: Technician[] = [
  { id: 'man001', nome: 'Luis Gustavo', avatar: 'LG', concluidas: 28, taxa: "95%", emAndamento: 2 },
  { id: 'man002', nome: 'Ana Silva', avatar: 'AS', concluidas: 22, taxa: "92%", emAndamento: 1 },
  { id: 'man003', nome: 'Carlos Souza', avatar: 'CS', concluidas: 15, taxa: "88%", emAndamento: 3 },
  { id: 'man004', nome: 'Beatriz Lima', avatar: 'BL', concluidas: 19, taxa: "98%", emAndamento: 0 },
  { id: 'man005', nome: 'Ricardo Mendes', avatar: 'RM', concluidas: 25, taxa: "90%", emAndamento: 1 },
];

// --- Mock systemFeedData REMOVIDO ---