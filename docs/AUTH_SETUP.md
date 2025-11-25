# Configuração de Autenticação - NextAuth v5

Este documento descreve a implementação de autenticação com NextAuth v5 (beta) usando Prisma adapter.

## 📋 Estrutura Implementada

### Arquivos Principais

1. **`auth.ts`** - Configuração principal do NextAuth
2. **`lib/auth.ts`** - Configuração de autenticação (providers, callbacks)
3. **`lib/prisma.ts`** - Cliente Prisma singleton
4. **`lib/session.ts`** - Helper para obter sessão no servidor
5. **`app/actions/auth.ts`** - Server actions para signup, login e logout
6. **`middleware.ts`** - Proteção de rotas
7. **`types/next-auth.d.ts`** - Tipos TypeScript para NextAuth

### Rotas Criadas

- `/login` - Página de login
- `/signup` - Página de cadastro
- `/perfil` - Página de perfil (protegida)
- `/upload` - Página de upload (protegida)
- `/meus-materiais` - Página de materiais (protegida)
- `/admin` - Página admin (protegida, apenas ADMIN)

## 🔐 Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# NextAuth v5 usa AUTH_SECRET (ou NEXTAUTH_SECRET para compatibilidade)
AUTH_SECRET="seu-secret-aqui"  # Gere com: openssl rand -base64 32
AUTH_URL="http://localhost:3000"  # URL base da aplicação
```

**Nota:** NextAuth v5 aceita tanto `AUTH_SECRET` quanto `NEXTAUTH_SECRET` para compatibilidade.

## 🚀 Funcionalidades

### 1. Signup (Cadastro)

- Validação com Zod
- Hash de senha com bcryptjs
- Verificação de email duplicado
- Login automático após cadastro
- Role padrão: `USUARIO`

**Uso:**

```typescript
import { signup } from "@/app/actions/auth";

const result = await signup(formData);
if (result?.error) {
  // Tratar erro
}
```

### 2. Login

- Validação com Zod
- Verificação de credenciais
- Redirecionamento após login bem-sucedido

**Uso:**

```typescript
import { login } from "@/app/actions/auth";

const result = await login(formData);
if (result?.error) {
  // Tratar erro
}
```

### 3. Logout

- Limpa sessão
- Redireciona para home

**Uso:**

```typescript
import { logout } from "@/app/actions/auth";

await logout();
```

## 📱 Uso no Cliente (Client Components)

### useSession Hook

```typescript
"use client";

import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return <div>Não autenticado</div>;
  }

  return (
    <div>
      <p>Olá, {session.user.name}!</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

**Importante:** O componente precisa estar dentro de `<SessionProvider>` (já configurado no `app/layout.tsx`).

## 🖥️ Uso no Servidor (Server Components)

### getServerSession

```typescript
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <p>Olá, {session.user.name}!</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### auth() (NextAuth v5)

```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Não autenticado</div>;
  }

  return <div>Autenticado: {session.user.email}</div>;
}
```

## 🛡️ Proteção de Rotas

O middleware protege automaticamente as seguintes rotas:

- `/upload` - Requer autenticação
- `/meus-materiais` - Requer autenticação
- `/admin` - Requer autenticação E role ADMIN
- `/perfil` - Requer autenticação

### Rotas Públicas

- `/` - Home
- `/login` - Login
- `/signup` - Cadastro
- `/api/auth/*` - Endpoints do NextAuth

### Proteção Manual em Server Components

```typescript
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <div>Conteúdo admin</div>;
}
```

## 🎫 Sessões JWT

As sessões são armazenadas em JWT (não no banco de dados) e incluem:

- `id` - ID do usuário
- `email` - Email do usuário
- `name` - Nome do usuário
- `role` - Role do usuário (VISITANTE, USUARIO, ADMIN)

### Acessando Role no Token

O role está disponível em:

- `session.user.role` - No cliente e servidor
- `token.role` - No callback JWT

## 🔒 Segurança

### Implementado

- ✅ Senhas hasheadas com bcryptjs (10 rounds)
- ✅ Validação de entrada com Zod
- ✅ Proteção CSRF (NextAuth)
- ✅ Sessões JWT seguras
- ✅ Middleware de proteção de rotas
- ✅ Verificação de role para rotas admin

### Boas Práticas

1. **Nunca exponha informações sensíveis** no cliente
2. **Sempre valide no servidor** - não confie apenas na validação do cliente
3. **Use HTTPS em produção**
4. **Mantenha AUTH_SECRET seguro** - nunca commite no Git
5. **Rotacione secrets periodicamente** em produção

## 📝 Exemplo Completo

### Página Protegida com Verificação de Role

```typescript
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/protected");
  }

  // Verificar role específico
  if (session.user.role !== "ADMIN") {
    return (
      <div>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Página Protegida</h1>
      <p>Bem-vindo, {session.user.name}!</p>
    </div>
  );
}
```

### Formulário de Login

```typescript
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(login, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {state?.error && <p>{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
```

## ✅ Checklist de Implementação

- [x] NextAuth v5 configurado
- [x] Prisma adapter instalado e configurado
- [x] Credentials provider com email/senha
- [x] Hash de senha com bcryptjs
- [x] Server actions para signup/login/logout
- [x] Middleware de proteção de rotas
- [x] Tipos TypeScript para NextAuth
- [x] Role exposto no token JWT
- [x] Rotas de exemplo criadas
- [x] Exemplos de useSession() e getServerSession()

## 🐛 Troubleshooting

### Erro: "AUTH_SECRET is not set"

Adicione `AUTH_SECRET` ou `NEXTAUTH_SECRET` ao `.env`.

### Erro: "Invalid credentials"

- Verifique se o usuário existe no banco
- Confirme que a senha está correta
- Verifique se `passwordHash` não é null

### Sessão não persiste

- Verifique se `SessionProvider` está no layout
- Confirme que `AUTH_SECRET` está configurado
- Verifique cookies no navegador

### Middleware não funciona

- Verifique se `middleware.ts` está na raiz do projeto
- Confirme que o matcher está correto
- Verifique logs do servidor
