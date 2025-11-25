# Configuração de Variáveis de Ambiente

Este guia explica como configurar as variáveis de ambiente necessárias para o projeto ICTI Share.

## 📋 Pré-requisitos

- PostgreSQL instalado e rodando (local ou remoto)
- Node.js e npm/pnpm instalados
- Conta em um serviço de e-mail (opcional, para funcionalidades de e-mail)

## 🚀 Configuração Rápida

### 1. Copiar arquivo de exemplo

```bash
cp .env.example .env
```

### 2. Configurar variáveis obrigatórias

Abra o arquivo `.env` e configure as seguintes variáveis:

#### **DATABASE_URL** (Obrigatório)

URL de conexão com o banco PostgreSQL.

**Formato:**
```
postgresql://[usuário]:[senha]@[host]:[porta]/[database]?schema=public
```

**Exemplos:**

- **Local:**
  ```env
  DATABASE_URL="postgresql://postgres:minhasenha@localhost:5432/icti_share?schema=public"
  ```

- **Railway:**
  ```env
  DATABASE_URL="postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway?schema=public"
  ```

- **Supabase:**
  ```env
  DATABASE_URL="postgresql://postgres.xxx:senha@aws-0-us-west-1.pooler.supabase.com:6543/postgres?schema=public"
  ```

- **Neon:**
  ```env
  DATABASE_URL="postgresql://user:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
  ```

#### **NEXTAUTH_URL** (Obrigatório)

URL base da aplicação.

```env
# Desenvolvimento
NEXTAUTH_URL="http://localhost:3000"

# Produção
NEXTAUTH_URL="https://seu-dominio.com"
```

#### **NEXTAUTH_SECRET** (Obrigatório)

Secret usado para criptografar tokens e sessões.

**Gerar um secret seguro:**

```bash
# Opção 1: OpenSSL
openssl rand -base64 32

# Opção 2: Online
# Acesse: https://generate-secret.vercel.app/32
```

```env
NEXTAUTH_SECRET="seu-secret-gerado-aqui"
```

### 3. Configurar variáveis opcionais

#### **UPLOAD_PATH** (Recomendado)

Caminho para armazenar arquivos PDF.

```env
# Desenvolvimento local
UPLOAD_PATH="./uploads"

# Railway (com volume persistente)
UPLOAD_PATH="/data/uploads"
```

**Nota:** Crie a pasta `uploads` se estiver usando caminho local:
```bash
mkdir -p uploads
```

#### **SMTP_*** (Opcional - para envio de e-mail)

Configure apenas se precisar de funcionalidades de e-mail (verificação, notificações).

**Gmail:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-app-password"  # Use App Password, não a senha normal
SMTP_FROM="noreply@seu-dominio.com"
SMTP_FROM_NAME="ICTI Share"
SMTP_SECURE=false
```

**Como obter App Password do Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Other (Custom name)"
3. Digite "ICTI Share"
4. Copie a senha gerada e use em `SMTP_PASSWORD`

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="sua-api-key-do-sendgrid"
SMTP_FROM="noreply@seu-dominio.com"
SMTP_FROM_NAME="ICTI Share"
SMTP_SECURE=false
```

**Resend:**
```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT=587
SMTP_USER="resend"
SMTP_PASSWORD="sua-api-key-do-resend"
SMTP_FROM="noreply@seu-dominio.com"
SMTP_FROM_NAME="ICTI Share"
SMTP_SECURE=false
```

## ✅ Verificação

Após configurar o `.env`, execute:

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Iniciar aplicação
npm run dev
```

## 🔒 Segurança

- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` já está no `.gitignore`
- Use `.env.example` como template
- Em produção, configure variáveis diretamente no painel do provedor (Railway, Vercel, etc.)
- Use secrets seguros e únicos para `NEXTAUTH_SECRET`

## 📝 Variáveis por Ambiente

### Desenvolvimento Local
```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/icti_share?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="desenvolvimento-secret-aqui"
UPLOAD_PATH="./uploads"
NODE_ENV="development"
```

### Produção (Railway/Vercel/etc)
```env
DATABASE_URL="postgresql://..."  # Fornecido pelo serviço
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="production-secret-forte-aqui"
UPLOAD_PATH="/data/uploads"  # Ou serviço de storage
NODE_ENV="production"
```

## 🆘 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que a variável está escrita corretamente (sem espaços extras)

### Erro de conexão com PostgreSQL
- Verifique se o PostgreSQL está rodando
- Confirme usuário, senha, host e porta
- Teste a conexão: `psql "postgresql://user:pass@host:port/db"`

### Erro: "Invalid NEXTAUTH_SECRET"
- Gere um novo secret usando `openssl rand -base64 32`
- Certifique-se de que o secret tem pelo menos 32 caracteres

### Arquivos não são salvos
- Verifique se a pasta `UPLOAD_PATH` existe e tem permissões de escrita
- Em produção, use volumes persistentes ou serviços de storage (S3, Cloudinary)

