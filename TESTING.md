# 🧪 Guia de Testes

Este documento descreve a estrutura de testes do projeto ICTI Share.

## 📋 Índice

1. [Testes Unitários](#testes-unitários)
2. [Testes E2E](#testes-e2e)
3. [Executando Testes](#executando-testes)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)

---

## 🧪 Testes Unitários

### Configuração

- **Jest** - Framework de testes
- **Testing Library** - Utilitários para testar componentes React
- **jest-environment-jsdom** - Ambiente DOM para testes

### Arquivos de Configuração

- `jest.config.js` - Configuração do Jest
- `jest.setup.js` - Setup global dos testes

### Executando Testes Unitários

```bash
# Executar todos os testes
pnpm test

# Executar em modo watch
pnpm test:watch

# Executar com cobertura
pnpm test:coverage
```

### Testes Implementados

#### Validação Zod (`__tests__/validations/schemas.test.ts`)

Testa todos os schemas de validação:
- ✅ `signupSchema` - Validação de cadastro
- ✅ `loginSchema` - Validação de login
- ✅ `uploadMaterialSchema` - Validação de upload
- ✅ `editMaterialSchema` - Validação de edição
- ✅ `editProfileSchema` - Validação de perfil

**Exemplo:**
```typescript
it("deve validar dados corretos", () => {
  const validData = {
    name: "João Silva",
    email: "joao@example.com",
    password: "senha123",
  };
  const result = signupSchema.safeParse(validData);
  expect(result.success).toBe(true);
});
```

#### Componente MaterialCard (`__tests__/components/MaterialCard.test.tsx`)

Testa renderização e comportamento:
- ✅ Renderização do título
- ✅ Renderização de descrição (variants)
- ✅ Exibição de downloads
- ✅ Informações do uploader
- ✅ Links e navegação

#### Componente UploadForm (`__tests__/components/UploadForm.test.tsx`)

Testa validação e comportamento do formulário:
- ✅ Validação de campos obrigatórios
- ✅ Mensagens de erro
- ✅ Campos opcionais

---

## 🎭 Testes E2E

### Configuração

- **Playwright** - Framework E2E
- Suporte para Chromium, Firefox e WebKit

### Arquivos de Configuração

- `playwright.config.ts` - Configuração do Playwright

### Executando Testes E2E

```bash
# Executar todos os testes E2E
pnpm test:e2e

# Executar com UI interativa
pnpm test:e2e:ui

# Executar em modo headed (com navegador visível)
pnpm test:e2e:headed
```

### Testes Implementados

#### Fluxo de Autenticação (`e2e/auth-flow.spec.ts`)

- ✅ Signup → Login → Logout
- ✅ Validação de credenciais inválidas
- ✅ Validação de formulários

#### Fluxo de Upload e Download (`e2e/upload-download-flow.spec.ts`)

- ✅ Login → Upload → Download
- ✅ Validação de formulário de upload
- ✅ Navegação entre páginas

#### Filtragem de Materiais (`e2e/filtering.spec.ts`)

- ✅ Exibição de página de materiais
- ✅ Filtragem de materiais
- ✅ Lista vazia

---

## 🚀 Executando Testes

### Pré-requisitos

1. Instalar dependências:
```bash
pnpm install
```

2. Configurar banco de dados de teste (se necessário)

### Comandos Disponíveis

```bash
# Testes Unitários
pnpm test              # Executar todos os testes unitários
pnpm test:watch        # Modo watch
pnpm test:coverage     # Com cobertura de código

# Testes E2E
pnpm test:e2e          # Executar todos os testes E2E
pnpm test:e2e:ui       # UI interativa
pnpm test:e2e:headed  # Com navegador visível
```

### Executar Testes Específicos

```bash
# Teste unitário específico
pnpm test schemas.test.ts

# Teste E2E específico
pnpm test:e2e auth-flow
```

---

## 📁 Estrutura de Arquivos

```
.
├── __tests__/                    # Testes unitários
│   ├── components/
│   │   ├── MaterialCard.test.tsx
│   │   └── UploadForm.test.tsx
│   └── validations/
│       └── schemas.test.ts
├── e2e/                          # Testes E2E
│   ├── auth-flow.spec.ts
│   ├── upload-download-flow.spec.ts
│   ├── filtering.spec.ts
│   └── helpers/
│       └── auth.ts
├── jest.config.js                # Configuração Jest
├── jest.setup.js                 # Setup Jest
├── playwright.config.ts          # Configuração Playwright
└── TESTING.md                    # Este arquivo
```

---

## 📊 Cobertura de Código

A configuração do Jest define um threshold mínimo de cobertura:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Para ver a cobertura:
```bash
pnpm test:coverage
```

Os relatórios são gerados em `coverage/`.

---

## 🔧 Configuração

### Jest

Configuração em `jest.config.js`:
- Ambiente: `jest-environment-jsdom`
- Setup: `jest.setup.js`
- Mocks: Next.js router, framer-motion, lucide-react

### Playwright

Configuração em `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Web Server: Inicia `pnpm dev` automaticamente

---

## 📝 Escrevendo Novos Testes

### Teste Unitário

```typescript
import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("deve renderizar corretamente", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Teste E2E

```typescript
import { test, expect } from "@playwright/test";

test("deve fazer algo", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Home/i);
});
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

Verifique se os paths no `tsconfig.json` estão corretos:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Erro: "window is not defined"

Certifique-se de que está usando `jest-environment-jsdom` no `jest.config.js`.

### Testes E2E não iniciam servidor

Verifique se a porta 3000 está disponível ou ajuste `baseURL` no `playwright.config.ts`.

---

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

---

**Última atualização:** 2024

