# 🚀 Guia Completo: Configuração Railway + PostgreSQL

Este guia passo-a-passo explica como configurar o Railway e PostgreSQL para a aplicação ICTI Share, incluindo a criação das tabelas do banco de dados.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app) (gratuita com plano Hobby)
- Repositório Git conectado ao Railway
- Acesso ao terminal/CLI (opcional, mas recomendado)

---

## 🎯 Passo 1: Criar Projeto no Railway

### 1.1. Criar Novo Projeto

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seu repositório
5. Selecione o repositório `icti-share`
6. Railway criará automaticamente um novo serviço

---

## 🗄️ Passo 2: Configurar Banco de Dados PostgreSQL

### 2.1. Criar Serviço PostgreSQL

1. No projeto Railway, clique em **"+ New"** (canto superior direito)
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Railway criará automaticamente um banco PostgreSQL
4. Aguarde alguns segundos até o banco estar pronto (status verde)

### 2.2. Obter DATABASE_URL

1. Clique no serviço **Postgres** criado
2. Vá na aba **"Variables"**
3. Copie o valor de `DATABASE_URL` (será usado no próximo passo)

**Formato esperado:**

```
postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
```

**⚠️ Importante:** Guarde esta URL, você precisará dela nas próximas etapas.

---

## 📦 Passo 3: Criar as Tabelas no Banco de Dados

O banco está vazio e precisa das tabelas. Você tem 3 opções:

### Opção A: Via Railway CLI (Recomendado)

#### 3.1. Instalar Railway CLI

```bash
# macOS
brew install railway

# Linux/Windows (via npm)
npm i -g @railway/cli
```

#### 3.2. Autenticar

```bash
railway login
```

#### 3.3. Conectar ao Projeto

```bash
railway link
# Selecione o projeto
```

**⚠️ Importante:** Por padrão, o Railway CLI conecta ao serviço da aplicação. Para executar migrações, você precisa estar no contexto do serviço PostgreSQL ou usar a DATABASE_URL do PostgreSQL.

#### 3.4. Executar Migrações

**Opção 1: Usando o serviço da aplicação (recomendado)**

Se você já configurou a `DATABASE_URL` no serviço da aplicação:

```bash
# Verificar qual serviço está conectado
railway status

# Se estiver no serviço icti-share, execute:
railway run npm run prisma:generate
railway run npm run prisma:migrate:deploy
```

**Opção 2: Conectar ao serviço PostgreSQL diretamente**

```bash
# Listar serviços do projeto
railway service

# Conectar ao serviço PostgreSQL
railway service postgres

# Executar migrações (usando DATABASE_URL do PostgreSQL)
railway run npm run prisma:generate
railway run npm run prisma:migrate:deploy
```

**Opção 3: Usar DATABASE_URL explicitamente**

```bash
# Obter DATABASE_URL do serviço PostgreSQL
railway variables --service postgres

# Executar com DATABASE_URL explícita
railway run --service icti-share --env DATABASE_URL="$(railway variables --service postgres --json | jq -r '.DATABASE_URL')" npm run prisma:migrate:deploy
```

**✅ Após executar, as tabelas serão criadas!**

**🔍 Verificar se funcionou:**

Se aparecer "No pending migrations to apply", pode significar:

- ✅ As migrações já foram aplicadas (verifique no Railway Dashboard → Postgres → Database → Data)
- ⚠️ O Prisma não está encontrando as migrações (verifique se a pasta `prisma/migrations` existe)
- ⚠️ A DATABASE_URL está apontando para o banco errado

**Para verificar se as tabelas foram criadas:**

```bash
railway run --service postgres psql $DATABASE_URL -c "\dt"
```

**📖 Se aparecer "No pending migrations to apply", consulte [RAILWAY_QUICK_FIX.md](./RAILWAY_QUICK_FIX.md) para solução rápida.**

### Opção B: Via Railway Dashboard (One-time)

1. No serviço da aplicação (`icti-share`), vá em **Settings**
2. Role até **"Deploy"**
3. Em **"Deploy Command"**, adicione:
   ```bash
   npm run prisma:generate && npm run prisma:migrate:deploy && npm run build
   ```
4. Salve e faça um novo deploy

**⚠️ Atenção:** Esta opção executa migrações a cada build. Use apenas para setup inicial.

### Opção C: Via Terminal Local (Com DATABASE_URL)

Se você tem a `DATABASE_URL` do Railway:

```bash
# 1. Configure a variável de ambiente temporariamente
export DATABASE_URL="postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway"

# 2. Gerar Prisma Client
npm run prisma:generate

# 3. Executar migrações
npm run prisma:migrate:deploy
```

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### 4.1. Acessar Variáveis de Ambiente

1. No serviço da aplicação (`icti-share`), vá em **Variables**
2. Clique em **"+ New Variable"** para cada variável

### 4.2. Variáveis Obrigatórias

#### **DATABASE_URL**

```
postgresql://postgres:senha@switchback.proxy.rlwy.net:28408/railway
```

**⚠️ IMPORTANTE:** Use a **`DATABASE_PUBLIC_URL`** do serviço PostgreSQL, **NÃO** a `DATABASE_URL` interna!

**Por quê?**

- `DATABASE_URL` (interna): `postgres.railway.internal:5432` - só funciona dentro dos containers
- `DATABASE_PUBLIC_URL` (pública): `switchback.proxy.rlwy.net:28408` - funciona de qualquer lugar

**Como obter:**

1. No serviço **Postgres**, vá em **Variables**
2. Copie o valor de **`DATABASE_PUBLIC_URL`** (não `DATABASE_URL`)
3. Use este valor no serviço **icti-share**

**📖 Para mais detalhes, consulte [RAILWAY_DATABASE_URL_FIX.md](./RAILWAY_DATABASE_URL_FIX.md)**

#### **AUTH_SECRET** (ou NEXTAUTH_SECRET)

```
seu-secret-gerado-aqui
```

**Gerar secret seguro:**

```bash
# Opção 1: OpenSSL
openssl rand -base64 32

# Opção 2: Online
# Acesse: https://generate-secret.vercel.app/32
```

#### **AUTH_URL** (ou NEXTAUTH_URL)

```
https://icti-share-production.up.railway.app
```

**Nota:** Substitua pelo domínio do seu projeto. Você pode verificar em **Settings** → **Domains**.

#### **NODE_ENV**

```
production
```

### 4.3. Variáveis Opcionais

#### **RAILWAY_VOLUME_PATH** (Para uploads de arquivos)

```
/data/uploads
```

**Nota:** Configure apenas se criar um Volume (Passo 5)

#### **UPLOAD_DIR** (Fallback)

```
/data/uploads
```

### 4.4. Resumo das Variáveis

| Variável              | Obrigatória | Descrição                   | Exemplo                      |
| --------------------- | ----------- | --------------------------- | ---------------------------- |
| `DATABASE_URL`        | ✅          | URL de conexão PostgreSQL   | `postgresql://postgres:...`  |
| `AUTH_SECRET`         | ✅          | Secret para NextAuth        | `abc123...` (32+ chars)      |
| `AUTH_URL`            | ✅          | URL base da aplicação       | `https://app.up.railway.app` |
| `NODE_ENV`            | ✅          | Ambiente de execução        | `production`                 |
| `RAILWAY_VOLUME_PATH` | ⚠️          | Caminho do volume (uploads) | `/data/uploads`              |
| `UPLOAD_DIR`          | ⚠️          | Fallback para uploads       | `/data/uploads`              |

---

## 📁 Passo 5: Configurar Volume para Uploads (Opcional)

Se você quer que os arquivos PDF sejam persistidos:

### 5.1. Criar Volume

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Volume"**
3. Configure:
   - **Name**: `uploads-volume`
   - **Size**: Mínimo 1GB (ajuste conforme necessário)
4. Clique em **"Add"**

### 5.2. Conectar Volume ao Serviço

1. No serviço da aplicação (`icti-share`), vá em **Settings**
2. Role até **"Volumes"**
3. Clique em **"Add Volume"**
4. Selecione o volume criado
5. Configure o **Mount Path**: `/data/uploads`
6. Salve as alterações

### 5.3. Adicionar Variável de Ambiente

Adicione a variável `RAILWAY_VOLUME_PATH` com o valor `/data/uploads` (Passo 4.3).

---

## 🚀 Passo 6: Fazer Deploy da Aplicação

### 6.1. Verificar Configurações do Build

1. No serviço da aplicação (`icti-share`), vá em **Settings**
2. Verifique:
   - **Build Command**: `npm run build` (ou vazio para detecção automática)
   - **Start Command**: `npm start` (ou vazio para detecção automática)
   - **Root Directory**: (deixe vazio)

### 6.2. Deploy Automático (via Git)

1. Faça push para a branch principal:
   ```bash
   git push origin main
   ```
2. Railway detectará automaticamente e iniciará o build
3. Acompanhe o progresso em **Deployments**

### 6.3. Verificar Logs

1. No serviço, vá em **Deployments**
2. Clique no deployment mais recente
3. Veja os logs em tempo real
4. Procure por erros ou avisos

---

## ✅ Passo 7: Verificar se Tudo Está Funcionando

### 7.1. Verificar Tabelas Criadas

1. No serviço **Postgres**, vá na aba **"Database"** → **"Data"**
2. Você deve ver as seguintes tabelas:
   - `users`
   - `materials`
   - `downloads`
   - `accounts`
   - `sessions`
   - `verification_tokens`

**Se as tabelas não aparecerem**, execute novamente o Passo 3.

### 7.2. Verificar Aplicação

1. Acesse a URL do projeto (em **Settings** → **Domains**)
2. Verifique se a aplicação carrega corretamente
3. Teste funcionalidades:
   - ✅ Cadastro de usuário (`/signup`)
   - ✅ Login (`/login`)
   - ✅ Upload de arquivo (`/upload`)
   - ✅ Visualização de materiais (`/materiais`)

### 7.3. Verificar Banco de Dados via Railway CLI

```bash
# Conectar ao banco
railway run psql $DATABASE_URL

# Listar tabelas
\dt

# Ver usuários
SELECT * FROM users;

# Sair
\q
```

---

## 🔄 Passo 8: Configurar Domínio Customizado (Opcional)

### 8.1. Adicionar Domínio

1. No serviço da aplicação, vá em **Settings**
2. Role até **"Domains"**
3. Clique em **"Generate Domain"** ou **"Custom Domain"**
4. Para domínio customizado:
   - Adicione o domínio
   - Configure os registros DNS conforme instruções
   - Aguarde a verificação

### 8.2. Atualizar AUTH_URL

Após configurar o domínio, atualize a variável `AUTH_URL`:

```
https://seu-dominio.com
```

---

## 🆘 Troubleshooting

### Problema: "You have no tables" no Railway

**Solução:** Execute as migrações do Prisma (Passo 3).

```bash
railway run npm run prisma:migrate:deploy
```

### Problema: "No pending migrations to apply"

Se você receber esta mensagem, pode significar:

**1. Migrações já foram aplicadas:**

- ✅ Verifique no Railway Dashboard → Postgres → Database → Data
- Se as tabelas existem, está tudo certo!

**2. DATABASE_URL apontando para localhost:**

- O output mostra `localhost:5432` ao invés do banco do Railway
- **Solução:** Configure a `DATABASE_URL` no serviço da aplicação:

  ```bash
  # Obter DATABASE_URL do PostgreSQL
  railway variables --service postgres

  # Configurar no serviço da aplicação
  railway variables --service icti-share
  # Adicione DATABASE_URL com o valor do PostgreSQL
  ```

**3. Railway conectado ao serviço errado:**

- Verifique: `railway status`
- Se estiver em `icti-share`, está correto (as migrações usam a DATABASE_URL configurada)
- Se necessário, reconecte: `railway link` e selecione o projeto

**4. Forçar verificação das tabelas:**

```bash
# Verificar se as tabelas existem
railway run --service postgres psql $DATABASE_URL -c "\dt"

# Se não existirem, forçar migração
railway run --service icti-share npm run prisma:migrate:deploy --force
```

### Problema: Erro de conexão com banco de dados

**Soluções:**

- Verifique se `DATABASE_URL` está configurada corretamente
- Confirme que o serviço PostgreSQL está rodando (status verde)
- Teste a conexão: `railway run psql $DATABASE_URL`

### Problema: Erro "AUTH_SECRET not found"

**Solução:** Adicione a variável `AUTH_SECRET` ou `NEXTAUTH_SECRET` nas variáveis de ambiente.

### Problema: Deploy falha

**Soluções:**

- Verifique os logs do deployment
- Confirme que todas as variáveis de ambiente estão configuradas
- Verifique se o `package.json` tem os scripts corretos

### Problema: "Unsupported engine" - Node.js 18 ao invés de 20

**Erro:**

```
npm warn EBADENGINE Unsupported engine {
  package: 'next@16.0.4',
  required: { node: '>=20.9.0' },
  current: { node: 'v18.20.5' }
}
```

**Solução:** O projeto já inclui:

- ✅ `.nvmrc` especificando Node.js 20
- ✅ `nixpacks.toml` configurado para Node.js 20
- ✅ `package.json` com `engines` especificando Node.js >= 20.9.0

Se o erro persistir, verifique no Railway Dashboard:

1. Vá em **Settings** → **Build**
2. Certifique-se de que não há configuração manual sobrescrevendo a versão do Node.js

### Problema: "EBUSY: resource busy or locked" durante build

**Solução:** O `nixpacks.toml` já está configurado para evitar este problema. Se persistir:

- Limpe o cache do build no Railway Dashboard
- Faça um novo deploy

### Problema: Uploads não funcionam

**Soluções:**

- Configure um Volume (Passo 5)
- Adicione `RAILWAY_VOLUME_PATH=/data/uploads` nas variáveis
- Verifique permissões do volume

---

## 📊 Checklist Final

Antes de considerar a configuração completa, verifique:

- [ ] Serviço PostgreSQL criado e rodando
- [ ] Tabelas criadas no banco (via migrações)
- [ ] Variável `DATABASE_URL` configurada
- [ ] Variável `AUTH_SECRET` configurada
- [ ] Variável `AUTH_URL` configurada
- [ ] Variável `NODE_ENV=production` configurada
- [ ] Aplicação fazendo deploy com sucesso
- [ ] É possível acessar a aplicação pela URL
- [ ] É possível criar conta de usuário
- [ ] É possível fazer login
- [ ] É possível fazer upload de arquivo
- [ ] Volume configurado (se necessário para uploads)

---

## 📚 Próximos Passos

Após configurar tudo:

1. **Criar primeiro usuário admin:**
   - Cadastre-se normalmente
   - Via Railway CLI, altere o role para ADMIN:

   ```bash
   railway run psql $DATABASE_URL
   UPDATE users SET role = 'ADMIN' WHERE email = 'seu-email@exemplo.com';
   ```

2. **Popular banco com dados de exemplo (opcional):**

   ```bash
   railway run npm run prisma:seed
   ```

3. **Configurar backups automáticos:**
   - No serviço PostgreSQL, vá em **Backups**
   - Configure backups automáticos

---

## 🔗 Links Úteis

- [Documentação Railway](https://docs.railway.app)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação NextAuth](https://authjs.dev)
- [Guia de Deploy Completo](./DEPLOY.md)

---

## 💡 Dicas

- **Backups:** Configure backups automáticos do PostgreSQL no Railway
- **Monitoramento:** Use a aba **Metrics** para monitorar uso de recursos
- **Logs:** Sempre verifique os logs em caso de problemas
- **Variáveis:** Nunca commite variáveis de ambiente no Git
- **Secrets:** Use secrets fortes e únicos para `AUTH_SECRET`

---

**Última atualização:** Novembro 2024
