# 📚 ICTI Share

> Plataforma de compartilhamento de materiais acadêmicos com controle de usuários, downloads e permissões.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)](https://www.postgresql.org/)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tech Stack](#-tech-stack)
- [Funcionalidades](#-funcionalidades)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Como Rodar Testes](#-como-rodar-testes)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Convenções de Código](#-convenções-de-código)
- [Critérios de Aceitação](#-critérios-de-aceitação)
- [Documentação](#-documentação)

---

## 🎯 Visão Geral

O **ICTI Share** é uma plataforma web moderna para compartilhamento de materiais acadêmicos (PDFs, documentos, etc.) desenvolvida com Next.js 16 (App Router), TypeScript e PostgreSQL. A aplicação oferece:

- ✅ **Autenticação completa** com NextAuth v5
- ✅ **Sistema de roles** (Visitante, Usuário, Admin)
- ✅ **Upload e download** de materiais com validação
- ✅ **Workflow de aprovação** para materiais (opcional)
- ✅ **Painel administrativo** completo
- ✅ **Filtros e busca** avançada
- ✅ **Rate limiting** e segurança OWASP
- ✅ **Interface moderna** com Tailwind CSS e shadcn/ui

---

## 🛠️ Tech Stack

### Core

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[React 18](https://react.dev/)** - Biblioteca UI
- **[Prisma](https://www.prisma.io/)** - ORM para PostgreSQL

### Autenticação & Segurança

- **[NextAuth v5](https://next-auth.js.org/)** - Autenticação
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hash de senhas
- **[Zod](https://zod.dev/)** - Validação de schemas

### UI/UX

- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[Framer Motion](https://www.framer.com/motion/)** - Animações
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[date-fns](https://date-fns.org/)** - Manipulação de datas

### Testes

- **[Jest](https://jestjs.io/)** - Testes unitários
- **[Testing Library](https://testing-library.com/)** - Testes de componentes
- **[Playwright](https://playwright.dev/)** - Testes E2E

### DevOps

- **[Railway](https://railway.app/)** - Deploy e hospedagem
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados

---

## ✨ Funcionalidades

### 🔐 Autenticação

- Cadastro de usuários com validação
- Login/Logout
- Recuperação de senha (preparado)
- Sessões JWT seguras
- Proteção de rotas por middleware

### 📄 Materiais

- Upload de arquivos (PDF, DOC, etc.)
- Validação de tipo e tamanho
- Metadados (curso, disciplina, semestre, tipo)
- Download com contador
- Filtros e busca avançada
- Paginação
- Workflow de aprovação (PENDING → APPROVED → REJECTED)

### 👥 Usuários

- Perfis personalizáveis
- Sistema de roles (VISITANTE, USUARIO, ADMIN)
- Histórico de uploads e downloads
- Edição de perfil

### 🛡️ Administração

- Painel administrativo completo
- Aprovação/Rejeição de materiais
- Gerenciamento de usuários e roles
- Estatísticas (uploads, downloads, top 10)
- Listagem de materiais pendentes

### 🔒 Segurança

- Rate limiting (upload, download, auth)
- Validação de arquivos (tipo, tamanho, MIME)
- Sanitização de inputs
- Headers de segurança (CSP, HSTS, etc.)
- Proteção CSRF (NextAuth)
- Hash de senhas com bcrypt

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Node.js** 18+ e npm/pnpm
- **PostgreSQL** 15+ (local ou remoto)
- **Git**

### Passo 1: Clonar Repositório

```bash
git clone <url-do-repositorio>
cd icti-share
```

### Passo 2: Instalar Dependências

```bash
npm install
# ou
pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:

   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis no `.env`:

   ```env
   # Banco de Dados
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/icti_share?schema=public"

   # NextAuth
   AUTH_SECRET="seu-secret-aqui"  # Gere com: openssl rand -base64 32
   AUTH_URL="http://localhost:3000"

   # Uploads (opcional)
   UPLOAD_DIR="./uploads"
   RAILWAY_VOLUME_PATH=""  # Deixe vazio em desenvolvimento

   # Ambiente
   NODE_ENV="development"
   ```

   **📝 Nota:** Para instruções detalhadas, consulte [ENV_SETUP.md](./ENV_SETUP.md)

### Passo 4: Configurar Banco de Dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# (Opcional) Popular com dados de exemplo
npm run prisma:seed
```

### Passo 5: Criar Diretório de Uploads

```bash
mkdir -p uploads
```

### Passo 6: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em **http://localhost:3000**

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build e Produção
npm run build            # Cria build de produção
npm start                # Inicia servidor de produção

# Banco de Dados
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrações (dev)
npm run prisma:migrate:deploy  # Executa migrações (produção)
npm run prisma:studio    # Abre Prisma Studio
npm run prisma:seed      # Popula banco com dados de exemplo

# Qualidade de Código
npm run lint             # Executa ESLint
npm run format           # Formata código com Prettier

# Testes
npm test                 # Testes unitários
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Testes com cobertura
npm run test:e2e         # Testes E2E
npm run test:e2e:ui      # Testes E2E com UI
```

### Dados de Teste (Seed)

Após executar o seed, você terá:

- **3 usuários:**
  - `admin@icti.edu.br` (senha: `senha123`) - Role: ADMIN
  - `joao.silva@icti.edu.br` (senha: `senha123`) - Role: USUARIO
  - `maria.santos@icti.edu.br` (senha: `senha123`) - Role: USUARIO

- **10 materiais** de exemplo com metadados variados
- **~500 downloads** históricos

Para mais detalhes, consulte [SEED.md](./SEED.md)

---

## 🧪 Como Rodar Testes

### Testes Unitários (Jest)

```bash
# Executar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com cobertura de código
npm run test:coverage
```

**Testes implementados:**

- ✅ Validação de schemas Zod
- ✅ Componentes React (MaterialCard, UploadForm)

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npm run test:e2e

# Com UI interativa
npm run test:e2e:ui

# Com navegador visível
npm run test:e2e:headed
```

**Testes implementados:**

- ✅ Fluxo de autenticação (signup → login → logout)
- ✅ Fluxo de upload e download
- ✅ Filtragem de materiais

**📝 Nota:** Para detalhes completos, consulte [TESTING.md](./TESTING.md)

---

## 📁 Estrutura de Pastas

```
icti-share/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── admin.ts             # Ações administrativas
│   │   ├── auth.ts              # Autenticação (login, signup, logout)
│   │   ├── materials.ts         # CRUD de materiais
│   │   ├── profile.ts           # Perfil do usuário
│   │   └── upload.ts            # Upload de arquivos
│   ├── admin/                   # Painel administrativo
│   │   └── page.tsx
│   ├── api/                     # API Routes
│   │   └── auth/[...nextauth]/  # NextAuth handler
│   ├── login/                   # Página de login
│   ├── signup/                  # Página de cadastro
│   ├── materiais/               # Listagem de materiais
│   ├── material/               # Detalhes e download
│   │   ├── [id]/               # Página de detalhes
│   │   └── download/[id]/      # Rota de download
│   ├── upload/                  # Página de upload
│   ├── meus-materiais/          # Materiais do usuário
│   ├── perfil/                  # Perfil do usuário
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home page
│   └── providers.tsx            # Providers (Client Component)
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── table.tsx
│   ├── AdminMaterialActions.tsx  # Ações admin para materiais
│   ├── EditProfileForm.tsx      # Formulário de edição de perfil
│   ├── Filters.tsx              # Filtros de busca
│   ├── Header.tsx               # Cabeçalho
│   ├── Footer.tsx               # Rodapé
│   ├── MaterialActions.tsx      # Ações de materiais (editar/deletar)
│   ├── MaterialCard.tsx          # Card de material
│   ├── MaterialList.tsx          # Lista de materiais
│   ├── Pagination.tsx           # Paginação
│   ├── UploadForm.tsx           # Formulário de upload
│   ├── UserMenu.tsx             # Menu do usuário
│   └── UserRoleEditor.tsx       # Editor de role (admin)
│
├── lib/                          # Bibliotecas e utilitários
│   ├── auth.ts                  # Configuração NextAuth
│   ├── prisma.ts                # Cliente Prisma singleton
│   ├── session.ts               # Helper de sessão
│   ├── utils.ts                 # Utilitários gerais
│   ├── security/                # Módulos de segurança
│   │   ├── file-validation.ts   # Validação de arquivos
│   │   ├── headers.ts           # Headers de segurança
│   │   ├── rate-limit.ts        # Rate limiting
│   │   └── sanitize.ts          # Sanitização de inputs
│   └── validations/             # Schemas Zod
│       └── schemas.ts
│
├── prisma/                       # Prisma ORM
│   ├── migrations/              # Migrações do banco
│   ├── schema.prisma            # Schema do banco
│   └── seed.ts                  # Seed do banco
│
├── types/                        # Tipos TypeScript
│   └── next-auth.d.ts           # Tipos NextAuth
│
├── __tests__/                    # Testes unitários
│   ├── components/
│   └── validations/
│
├── e2e/                          # Testes E2E
│   ├── auth-flow.spec.ts
│   ├── filtering.spec.ts
│   ├── upload-download-flow.spec.ts
│   └── helpers/
│
├── scripts/                      # Scripts utilitários
│   ├── backup-db.sh
│   ├── backup-uploads.sh
│   └── restore-db.sh
│
├── middleware.ts                 # Middleware Next.js (proteção de rotas)
├── auth.ts                       # Configuração NextAuth (export)
├── next.config.js                # Configuração Next.js
├── tailwind.config.js            # Configuração Tailwind
├── tsconfig.json                 # Configuração TypeScript
└── package.json                  # Dependências e scripts
```

---

## 📐 Convenções de Código

### Server Components vs Client Components

#### Server Components (Padrão)

- **Não** incluem `"use client"`
- Executam no servidor
- Acesso direto ao banco de dados
- Sem hooks do React (useState, useEffect, etc.)
- Melhor performance

**Exemplo:**

```typescript
// app/materiais/page.tsx (Server Component)
import { prisma } from "@/lib/prisma";

export default async function MateriaisPage() {
  const materials = await prisma.material.findMany();
  return <MaterialList materials={materials} />;
}
```

#### Client Components

- Incluem `"use client"` no topo
- Executam no cliente
- Podem usar hooks e interatividade
- Necessários para formulários, modais, etc.

**Exemplo:**

```typescript
// components/UploadForm.tsx (Client Component)
"use client";

import { useState } from "react";

export function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  // ...
}
```

### Server Actions

- Sempre começam com `"use server"`
- Localizadas em `app/actions/`
- Protegidas por autenticação quando necessário
- Validação com Zod

**Exemplo:**

```typescript
// app/actions/upload.ts
"use server";

import { auth } from "@/auth";
import { z } from "zod";

export async function uploadMaterial(formData: FormData) {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Não autenticado" };
  }
  // ...
}
```

### Convenções de Nomenclatura

- **Componentes:** PascalCase (`MaterialCard.tsx`)
- **Arquivos de página:** `page.tsx` (Next.js App Router)
- **Server Actions:** camelCase (`uploadMaterial`)
- **Tipos/Interfaces:** PascalCase (`Material`, `UserRole`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Estrutura de Arquivos

```
app/
  [feature]/
    page.tsx          # Página principal
    [id]/
      page.tsx        # Página dinâmica
components/
  [Feature]/
    [Component].tsx   # Componente específico
  ui/
    [component].tsx   # Componente shadcn/ui
lib/
  [module]/
    [file].ts         # Utilitário específico
```

### Validação

- Sempre use **Zod** para validação
- Schemas em `lib/validations/schemas.ts`
- Valide no servidor (Server Actions)
- Valide no cliente (opcional, para UX)

### Segurança

- ✅ Sempre valide inputs no servidor
- ✅ Use Server Actions para mutações
- ✅ Sanitize strings e nomes de arquivos
- ✅ Valide tipos MIME e tamanhos de arquivo
- ✅ Implemente rate limiting
- ✅ Use headers de segurança

---

## ✅ Critérios de Aceitação

### 🏠 Página Inicial (`/`)

- [ ] Exibe hero section com título e descrição
- [ ] Mostra botão "Explorar Materiais" sempre visível
- [ ] Mostra botão "Enviar Material" se autenticado
- [ ] Mostra botão "Entrar" se não autenticado
- [ ] Exibe seção de materiais em destaque (top 6)
- [ ] Cada material mostra: título, autor, downloads, data
- [ ] Links funcionam corretamente
- [ ] Layout responsivo (mobile, tablet, desktop)
- [ ] Animações suaves (Framer Motion)

### 🔐 Autenticação

#### Login (`/login`)

- [ ] Formulário com email e senha
- [ ] Validação de campos obrigatórios
- [ ] Mensagens de erro claras
- [ ] Redireciona após login bem-sucedido
- [ ] Mantém `callbackUrl` se fornecido
- [ ] Link para página de cadastro
- [ ] Não permite acesso se já autenticado

#### Cadastro (`/signup`)

- [ ] Formulário com nome, email, senha, confirmar senha
- [ ] Validação de email válido
- [ ] Validação de senha (mínimo 6 caracteres)
- [ ] Confirmação de senha deve coincidir
- [ ] Mensagens de erro claras
- [ ] Login automático após cadastro
- [ ] Link para página de login
- [ ] Não permite acesso se já autenticado

#### Logout

- [ ] Botão de logout no menu do usuário
- [ ] Limpa sessão corretamente
- [ ] Redireciona para home após logout

### 📄 Materiais

#### Listagem (`/materiais`)

- [ ] Exibe todos os materiais aprovados
- [ ] Filtros funcionais (curso, disciplina, semestre, tipo)
- [ ] Busca por texto (título e descrição)
- [ ] Paginação funcional
- [ ] Ordenação por data (mais recentes primeiro)
- [ ] Cards responsivos
- [ ] Links para detalhes funcionam
- [ ] Exibe informações: título, autor, downloads, data

#### Detalhes (`/material/[id]`)

- [ ] Exibe informações completas do material
- [ ] Mostra: título, descrição, metadados, autor, data
- [ ] Botão de download funcional
- [ ] Contador de downloads atualizado
- [ ] Link para perfil do autor (se disponível)
- [ ] Botões de ação (editar/deletar) se for o dono
- [ ] Layout responsivo

#### Upload (`/upload`)

- [ ] Formulário completo com todos os campos
- [ ] Upload de arquivo (PDF, DOC, etc.)
- [ ] Validação de tipo de arquivo
- [ ] Validação de tamanho (máximo configurado)
- [ ] Campos: título (obrigatório), descrição, curso, disciplina, semestre, tipo
- [ ] Mensagens de erro claras
- [ ] Feedback de sucesso
- [ ] Redireciona após upload bem-sucedido
- [ ] Protegido por autenticação
- [ ] Rate limiting funcional

#### Meus Materiais (`/meus-materiais`)

- [ ] Lista apenas materiais do usuário logado
- [ ] Exibe status do material (PENDING, APPROVED, REJECTED)
- [ ] Botões de editar e deletar funcionais
- [ ] Confirmação antes de deletar
- [ ] Feedback de ações
- [ ] Ordenação por data (mais recentes primeiro)
- [ ] Protegido por autenticação

### 👤 Perfil (`/perfil`)

- [ ] Exibe informações do usuário
- [ ] Estatísticas: materiais enviados, downloads realizados
- [ ] Formulário de edição funcional
- [ ] Validação de campos
- [ ] Atualização em tempo real
- [ ] Protegido por autenticação

### 🛡️ Administração (`/admin`)

#### Acesso

- [ ] Apenas usuários com role ADMIN podem acessar
- [ ] Redireciona não-admins para home
- [ ] Redireciona não-autenticados para login

#### Estatísticas

- [ ] Cards com: total de materiais, pendentes, downloads, usuários
- [ ] Valores corretos e atualizados
- [ ] Ícones apropriados

#### Materiais Pendentes

- [ ] Lista apenas materiais com status PENDING
- [ ] Exibe: título, autor, data de upload
- [ ] Botões: Aprovar, Rejeitar, Remover
- [ ] Ações funcionam corretamente
- [ ] Feedback de ações
- [ ] Atualização em tempo real

#### Top 10 Downloads

- [ ] Lista top 10 materiais mais baixados
- [ ] Ordenação por downloadsCount (desc)
- [ ] Exibe: posição, título, autor, downloads, data
- [ ] Links funcionam

#### Gerenciamento de Usuários

- [ ] Lista todos os usuários
- [ ] Exibe: nome, email, role, materiais, downloads, data
- [ ] Editor de role funcional
- [ ] Não permite remover próprio acesso admin
- [ ] Feedback de ações
- [ ] Atualização em tempo real

### 🔒 Segurança

- [ ] Rate limiting em upload, download e auth
- [ ] Validação de arquivos (tipo, tamanho, MIME)
- [ ] Sanitização de inputs
- [ ] Headers de segurança aplicados
- [ ] Proteção CSRF (NextAuth)
- [ ] Senhas hasheadas (bcrypt)
- [ ] Sessões JWT seguras
- [ ] Middleware protege rotas corretamente

### 🎨 UI/UX

- [ ] Design consistente (Tailwind + shadcn/ui)
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessível (ARIA labels, navegação por teclado)
- [ ] Animações suaves (Framer Motion)
- [ ] Feedback visual em ações
- [ ] Mensagens de erro claras
- [ ] Loading states apropriados

### 📱 Responsividade

- [ ] Mobile (< 768px): layout adaptado
- [ ] Tablet (768px - 1024px): layout intermediário
- [ ] Desktop (> 1024px): layout completo
- [ ] Navegação funcional em todos os tamanhos
- [ ] Formulários usáveis em mobile

---

## 📚 Documentação

### Documentos Principais

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Configuração de variáveis de ambiente
- **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy no Railway
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Configuração de autenticação
- **[TESTING.md](./TESTING.md)** - Guia de testes
- **[SEED.md](./SEED.md)** - População do banco de dados
- **[SECURITY.md](./SECURITY.md)** - Implementações de segurança

### Documentos Técnicos

- **[SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)** - Detalhes de segurança
- **[CI_CD.md](./CI_CD.md)** - Configuração de CI/CD
- **[SETUP_CI.md](./SETUP_CI.md)** - Setup de CI

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona funcionalidade de busca
fix: corrige bug no upload
docs: atualiza README
style: formata código
refactor: refatora componente
test: adiciona testes
chore: atualiza dependências
```

---

## 📄 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](./LICENSE).

---

## 👥 Autores

- **Equipe ICTI** - Desenvolvimento inicial

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

**Última atualização:** 2024-11-24
