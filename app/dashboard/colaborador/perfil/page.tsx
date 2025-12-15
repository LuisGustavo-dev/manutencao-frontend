'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '@/app/contexts/authContext';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { user } = useAuth();

  const handleSave = () => {
    toast.success("Dados atualizados com sucesso!");
  };

  return (
    <div className="mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User className="w-6 h-6 text-primary" /> Meu Perfil
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-white text-xl">{user?.nome?.charAt(0) || 'C'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user?.nome || 'Colaborador'}</CardTitle>
            <CardDescription>{user?.email || 'email@exemplo.com'}</CardDescription>
            <CardDescription>Técnico Nível 1</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input defaultValue={user?.nome} />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Corporativo</Label>
            <Input defaultValue={user?.email} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="w-4 h-4" /> Segurança</CardTitle>
          <CardDescription>Alterar sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Senha Atual</Label>
            <Input type="password" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input type="password" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}