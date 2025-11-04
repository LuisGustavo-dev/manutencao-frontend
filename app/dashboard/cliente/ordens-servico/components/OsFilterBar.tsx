'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface OsFilterBarProps {
  searchTerm: string;
  tipoFilter: string;
  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
}

export function OsFilterBar({ 
  searchTerm, 
  tipoFilter, 
  onSearchChange, 
  onTipoChange 
}: OsFilterBarProps) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por OS ou equipamento..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={tipoFilter} onValueChange={onTipoChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="Corretiva">Corretiva</SelectItem>
            <SelectItem value="Preventiva">Preventiva</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}