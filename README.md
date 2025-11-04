# 📌 Painel Administrativo - Next.js

Este projeto é um painel administrativo desenvolvido com **Next.js**, utilizando **ShadCN**, **WebSockets** e suporte a **modo escuro**. Ele inclui funcionalidades como cadastro de usuários, sistema de mensagens, geração de relatórios e exportação de dados para PDF.

---

## 🚀 Tecnologias Utilizadas

- **Next.js** - Framework React para aplicações modernas
- **ShadCN** - Biblioteca de componentes estilizados
- **Tailwind CSS** - Estilização eficiente
- **WebSockets** - Comunicação em tempo real
- **jsPDF + AutoTable** - Exportação de relatórios em PDF
- **LocalStorage** - Armazenamento de dados do usuário
- **React Hook Form + Zod** - Gerenciamento e validação de formulários
- **NextAuth.js** - Autenticação segura

---

## 📥 Instalação e Configuração

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```

2. Acesse o diretório do projeto:
   ```sh
   cd nome-do-projeto
   ```

3. Instale as dependências:
   ```sh
   npm install  # ou yarn install
   ```

4. Configure as variáveis de ambiente:
   - Renomeie o arquivo `.env.example` para `.env.local` e preencha os valores necessários.

5. Inicie o servidor de desenvolvimento:
   ```sh
   npm run dev  # ou yarn dev
   ```

O projeto estará rodando em `http://localhost:3000`.

---

## 🔧 Funcionalidades

✅ **Autenticação e controle de acesso**
✅ **Cadastro e gerenciamento de usuários**
✅ **Sistema de mensagens com WebSockets**
✅ **Geração de relatórios com exportação para PDF**
✅ **Tema escuro e responsividade**
✅ **Filtros e ordenação de dados**

---

## 📜 Estrutura do Projeto

```
📂 src
 ┣ 📂 components      # Componentes reutilizáveis
 ┣ 📂 hooks           # Hooks personalizados
 ┣ 📂 pages           # Páginas do Next.js
 ┣ 📂 services        # Requisições à API
 ┣ 📂 utils           # Funções auxiliares
 ┗ 📂 styles          # Estilizações globais
```

---

## 🛠️ Deploy

Para realizar o deploy, utilize **Vercel**:

```sh
npm run build  # ou yarn build
vercel deploy
```

Caso esteja usando outra hospedagem, garanta que as variáveis de ambiente estejam configuradas corretamente.

---

## 📌 Melhorias Futuras

- 📌 Implementação de notificações em tempo real
- 📌 Dashboard com gráficos interativos
- 📌 Integração com APIs externas para relatórios avançados

---

## 👥 Contribuição

Sinta-se à vontade para abrir issues e pull requests!

1. Faça um fork do repositório
2. Crie uma branch para sua feature:
   ```sh
   git checkout -b minha-feature
   ```
3. Commit suas mudanças:
   ```sh
   git commit -m "Adicionando nova funcionalidade"
   ```
4. Envie seu código:
   ```sh
   git push origin minha-feature
   ```
5. Abra um **Pull Request** 🚀

---

💡 **Desenvolvido com Next.js e paixão pelo código!** 🚀

"# manutencao-frontend" 
