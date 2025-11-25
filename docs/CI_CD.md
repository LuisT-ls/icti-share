# 🚀 CI/CD e Qualidade de Código

Este documento descreve a configuração de CI/CD e ferramentas de qualidade de código do projeto.

## 📋 Índice

1. [GitHub Actions](#github-actions)
2. [ESLint](#eslint)
3. [Prettier](#prettier)
4. [Husky e lint-staged](#husky-e-lint-staged)
5. [Como Usar](#como-usar)

---

## 🔄 GitHub Actions

### Configuração

O workflow de CI está configurado em `.github/workflows/ci.yml`.

### Jobs

#### 1. lint-and-test

- **Quando:** Em push e pull requests para `main` e `develop`
- **Executa:**
  - ✅ `pnpm install --frozen-lockfile`
  - ✅ `pnpm lint` (ESLint)
  - ✅ `pnpm test --coverage --ci` (Jest)
  - ✅ `pnpm build` (Next.js build)

#### 2. e2e

- **Quando:** Após `lint-and-test` passar
- **Executa:**
  - ✅ Instala dependências
  - ✅ Instala browsers do Playwright
  - ✅ `pnpm test:e2e` (Testes E2E)

### Variáveis de Ambiente

O workflow usa secrets do GitHub para variáveis sensíveis:

```yaml
DATABASE_URL: ${{ secrets.DATABASE_URL }}
AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
AUTH_URL: ${{ secrets.AUTH_URL }}
```

**Configurar no GitHub:**

1. Vá em Settings → Secrets and variables → Actions
2. Adicione as variáveis necessárias

### Verificar Status

O status do CI aparece:

- ✅ No GitHub na aba "Actions"
- ✅ Como badge no README (opcional)
- ✅ Em pull requests como status check

---

## 🔍 ESLint

### Configuração

Arquivo: `.eslintrc.json`

### Regras Configuradas

#### TypeScript

- ✅ `@typescript-eslint/no-unused-vars` - Erro para variáveis não usadas
- ✅ `@typescript-eslint/no-explicit-any` - Aviso para uso de `any`
- ✅ Desabilitado: `explicit-function-return-type` (inferência automática)

#### React/Next.js

- ✅ `react/react-in-jsx-scope` - Desabilitado (não necessário no Next.js)
- ✅ `react-hooks/rules-of-hooks` - Erro para violações de hooks
- ✅ `@next/next/no-html-link-for-pages` - Erro para links HTML em vez de Next.js Link
- ✅ `@next/next/no-img-element` - Aviso para uso de `<img>` em vez de `<Image>`

#### Geral

- ✅ `no-console` - Aviso (permite `console.warn` e `console.error`)
- ✅ `prefer-const` - Erro para variáveis que podem ser `const`
- ✅ `no-var` - Erro para uso de `var`

### Executar

```bash
# Verificar erros
pnpm lint

# Corrigir automaticamente (quando possível)
pnpm lint --fix
```

### Ignorar Arquivos

Arquivos ignorados:

- `node_modules/`
- `.next/`
- `out/`, `build/`, `dist/`
- `coverage/`
- `*.config.js`, `*.config.ts`

---

## 💅 Prettier

### Configuração

Arquivo: `.prettierrc`

### Opções

```json
{
  "semi": true, // Usar ponto e vírgula
  "trailingComma": "es5", // Vírgula final quando possível
  "singleQuote": false, // Aspas duplas
  "printWidth": 80, // Largura máxima da linha
  "tabWidth": 2, // Espaços por tab
  "useTabs": false, // Usar espaços, não tabs
  "arrowParens": "always", // Sempre usar parênteses em arrow functions
  "endOfLine": "lf" // Line feed (Unix)
}
```

### Executar

```bash
# Formatar todos os arquivos
pnpm format

# Verificar sem formatar
npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"
```

### Arquivos Ignorados

Ver `.prettierignore`:

- Dependências (`node_modules`)
- Build outputs (`.next`, `out`, `build`)
- Arquivos de lock (`package-lock.json`, etc.)
- Arquivos gerados (`*.tsbuildinfo`)

---

## 🪝 Husky e lint-staged

### Configuração

**Husky** - Git hooks
**lint-staged** - Executa linters apenas em arquivos staged

### Hooks Configurados

#### pre-commit

Executa `lint-staged` antes de cada commit:

- ✅ ESLint nos arquivos `.js`, `.jsx`, `.ts`, `.tsx`
- ✅ Prettier em todos os arquivos relevantes

#### commit-msg

Hook para validar mensagens de commit (opcional, comentado)

### Configuração no package.json

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,scss}": ["prettier --write"]
  }
}
```

### Instalação

O Husky é instalado automaticamente via script `prepare`:

```bash
pnpm install  # Executa "husky install" automaticamente
```

### Como Funciona

1. Você faz `git commit`
2. Husky intercepta o commit
3. `lint-staged` executa ESLint e Prettier nos arquivos staged
4. Se houver erros, o commit é bloqueado
5. Se tudo passar, o commit prossegue

### Pular Hooks (Não Recomendado)

```bash
# ⚠️ Use apenas em emergências
git commit --no-verify
```

---

## 🚀 Como Usar

### Setup Inicial

1. **Instalar dependências:**

```bash
pnpm install
```

2. **Husky será configurado automaticamente** via script `prepare`

3. **Verificar configuração:**

```bash
# Verificar ESLint
pnpm lint

# Verificar Prettier
npx prettier --check "**/*.{js,jsx,ts,tsx}"

# Formatar código
pnpm format
```

### Workflow Diário

1. **Fazer alterações no código**

2. **Adicionar ao stage:**

```bash
git add .
```

3. **Tentar fazer commit:**

```bash
git commit -m "feat: adiciona nova funcionalidade"
```

4. **Husky executa automaticamente:**
   - ESLint verifica e corrige erros
   - Prettier formata o código
   - Se houver erros não corrigíveis, o commit é bloqueado

5. **Se bloqueado, corrigir erros e tentar novamente**

### CI/CD no GitHub

1. **Fazer push:**

```bash
git push origin main
```

2. **GitHub Actions executa automaticamente:**
   - Instala dependências
   - Executa lint
   - Executa testes
   - Faz build
   - Executa testes E2E

3. **Verificar status:**
   - Vá em "Actions" no GitHub
   - Veja o status do workflow

### Configurar Secrets no GitHub

Para o CI funcionar completamente, configure secrets:

1. Vá em: **Settings → Secrets and variables → Actions**
2. Adicione:
   - `DATABASE_URL` (para testes)
   - `AUTH_SECRET` (para build)
   - `AUTH_URL` (opcional)

---

## 📊 Status Badges (Opcional)

Adicione ao README.md:

```markdown
![CI](https://github.com/seu-usuario/icti-share/workflows/CI/badge.svg)
```

---

## 🐛 Troubleshooting

### Erro: "Husky not found"

```bash
pnpm install
# Ou manualmente:
pnpm exec husky install
```

### Erro: "lint-staged not found"

```bash
pnpm install lint-staged --save-dev
```

### ESLint muito lento

- Verifique se `node_modules` está no `.eslintignore`
- Considere usar `eslint --cache`

### Pre-commit não executa

```bash
# Verificar se hooks estão instalados
ls -la .git/hooks/

# Reinstalar Husky
pnpm exec husky install
```

### CI falha no GitHub

1. Verifique logs em "Actions"
2. Teste localmente:

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

---

## 📚 Referências

- [GitHub Actions](https://docs.github.com/en/actions)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)

---

**Última atualização:** 2024
