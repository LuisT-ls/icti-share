# 🚀 Setup Rápido - CI/CD e Qualidade de Código

## ✅ Checklist de Configuração

### 1. Instalar Dependências

```bash
pnpm install
```

Isso irá:

- ✅ Instalar todas as dependências
- ✅ Configurar Husky automaticamente (via script `prepare`)

### 2. Verificar Configuração

```bash
# Verificar ESLint
pnpm lint

# Verificar Prettier
npx prettier --check "**/*.{js,jsx,ts,tsx}"

# Formatar código
pnpm format
```

### 3. Testar Hooks do Git

```bash
# Fazer uma alteração pequena
echo "// teste" >> test.ts

# Adicionar ao stage
git add test.ts

# Tentar fazer commit (deve executar lint-staged)
git commit -m "test: verificar hooks"

# Limpar
git reset HEAD test.ts
rm test.ts
```

### 4. Configurar GitHub Secrets (Opcional)

Para o CI funcionar completamente:

1. Vá em: **GitHub → Settings → Secrets and variables → Actions**
2. Adicione:
   - `DATABASE_URL` (para testes)
   - `AUTH_SECRET` (para build)
   - `AUTH_URL` (opcional)

## 📁 Arquivos Criados

```
.github/
└── workflows/
    └── ci.yml              # GitHub Actions workflow

.husky/
├── _/
│   └── husky.sh            # Script base do Husky
├── pre-commit              # Hook pre-commit
└── commit-msg              # Hook commit-msg

.eslintrc.json              # Configuração ESLint
.prettierrc                 # Configuração Prettier
.prettierignore             # Arquivos ignorados pelo Prettier
```

## 🎯 Comandos Disponíveis

```bash
# Linting
pnpm lint                   # Verificar erros ESLint
pnpm lint --fix            # Corrigir erros automaticamente

# Formatação
pnpm format                # Formatar todos os arquivos

# Testes
pnpm test                  # Testes unitários
pnpm test:coverage         # Com cobertura
pnpm test:e2e             # Testes E2E

# Build
pnpm build                 # Build de produção
```

## 🔄 Fluxo de Trabalho

1. **Fazer alterações no código**
2. **Adicionar ao stage:** `git add .`
3. **Fazer commit:** `git commit -m "mensagem"`
   - Husky executa `lint-staged` automaticamente
   - ESLint e Prettier são executados nos arquivos staged
4. **Push:** `git push`
   - GitHub Actions executa CI automaticamente

## 📚 Documentação Completa

Consulte `CI_CD.md` para documentação detalhada.
