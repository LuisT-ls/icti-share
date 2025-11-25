# 🚀 Guia de Deploy no Railway

Este guia fornece instruções passo-a-passo para fazer deploy da aplicação ICTI Share no Railway, incluindo configuração de banco de dados, volumes persistentes, variáveis de ambiente e migrações.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app) (gratuita com plano Hobby)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Acesso ao terminal/CLI

## 🎯 Passo 1: Criar Projeto no Railway

### 1.1. Criar Novo Projeto

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"** (ou seu provedor Git)
4. Autorize o Railway a acessar seu repositório
5. Selecione o repositório `icti-share`
6. Railway criará automaticamente um novo serviço

### 1.2. Configurar Build Settings

O Railway detecta automaticamente projetos Next.js, mas você pode verificar:

1. No painel do serviço, vá em **Settings**
2. Em **Build Command**, certifique-se de que está:
   ```bash
   npm run build
   ```
3. Em **Start Command**, certifique-se de que está:
   ```bash
   npm start
   ```

## 🗄️ Passo 2: Configurar Banco de Dados PostgreSQL

### 2.1. Criar Serviço PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Railway criará automaticamente um banco PostgreSQL
4. Aguarde alguns segundos até o banco estar pronto

### 2.2. Obter DATABASE_URL

1. Clique no serviço PostgreSQL criado
2. Vá na aba **"Variables"**
3. Copie o valor de `DATABASE_URL` (será usado no próximo passo)

**Formato esperado:**

```
postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
```

## 📦 Passo 3: Configurar Railway Volume (Armazenamento Persistente)

### 3.1. Criar Volume

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Volume"**
3. Configure:
   - **Name**: `uploads-volume` (ou qualquer nome)
   - **Size**: Mínimo 1GB (ajuste conforme necessário)
4. Clique em **"Add"**

### 3.2. Conectar Volume ao Serviço

1. No serviço da aplicação, vá em **Settings**
2. Role até **"Volumes"**
3. Clique em **"Add Volume"**
4. Selecione o volume criado
5. Configure o **Mount Path**: `/data/uploads`
6. Salve as alterações

**Importante:** O mount path será usado como `RAILWAY_VOLUME_PATH` nas variáveis de ambiente.

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### 4.1. Acessar Variáveis de Ambiente

1. No serviço da aplicação, vá em **Variables**
2. Clique em **"+ New Variable"** para cada variável

### 4.2. Variáveis Obrigatórias

Adicione as seguintes variáveis:

#### **DATABASE_URL**

```
postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
```

**Nota:** Use o valor copiado do serviço PostgreSQL (Passo 2.2)

#### **AUTH_SECRET** ou **NEXTAUTH_SECRET**

```
seu-secret-gerado-aqui
```

**Gerar secret seguro:**

```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

**Nota:** NextAuth v5 aceita ambos `AUTH_SECRET` e `NEXTAUTH_SECRET`. Use apenas um.

#### **AUTH_URL** ou **NEXTAUTH_URL**

```
https://seu-projeto.up.railway.app
```

**Nota:** Substitua `seu-projeto` pelo domínio gerado pelo Railway. Você pode verificar em **Settings** → **Domains**.

#### **RAILWAY_VOLUME_PATH**

```
/data/uploads
```

**Nota:** Este é o mount path configurado no Passo 3.2.

#### **UPLOAD_DIR** (Opcional - Fallback)

```
/data/uploads
```

**Nota:** Se `RAILWAY_VOLUME_PATH` não estiver definido, a aplicação usará `UPLOAD_DIR` ou `./uploads` como fallback.

#### **NODE_ENV**

```
production
```

### 4.3. Variáveis Opcionais

#### **SMTP\_\*** (Apenas se usar e-mail)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-app-password
SMTP_FROM=noreply@seu-dominio.com
SMTP_FROM_NAME=ICTI Share
SMTP_SECURE=false
```

### 4.4. Resumo das Variáveis

| Variável                           | Obrigatória | Descrição                 | Exemplo                      |
| ---------------------------------- | ----------- | ------------------------- | ---------------------------- |
| `DATABASE_URL`                     | ✅          | URL de conexão PostgreSQL | `postgresql://postgres:...`  |
| `AUTH_SECRET` ou `NEXTAUTH_SECRET` | ✅          | Secret para NextAuth      | `abc123...` (32+ chars)      |
| `AUTH_URL` ou `NEXTAUTH_URL`       | ✅          | URL base da aplicação     | `https://app.up.railway.app` |
| `RAILWAY_VOLUME_PATH`              | ✅          | Caminho do volume montado | `/data/uploads`              |
| `UPLOAD_DIR`                       | ⚠️          | Fallback para uploads     | `/data/uploads`              |
| `NODE_ENV`                         | ✅          | Ambiente de execução      | `production`                 |
| `SMTP_*`                           | ❌          | Configuração de e-mail    | (opcional)                   |

## 🗃️ Passo 5: Executar Migrações do Banco de Dados

### 5.1. Opção A: Via Railway CLI (Recomendado)

#### Instalar Railway CLI

```bash
# macOS
brew install railway

# Linux/Windows (via npm)
npm i -g @railway/cli
```

#### Autenticar

```bash
railway login
```

#### Conectar ao Projeto

```bash
railway link
# Selecione o projeto e serviço
```

#### Executar Migrações

```bash
# Gerar Prisma Client
railway run npm run prisma:generate

# Executar migrações
railway run npm run prisma:migrate:deploy
```

### 5.2. Opção B: Via Script de Deploy (Automático)

Crie um arquivo `railway.json` na raiz do projeto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build && npm run prisma:generate"
  },
  "deploy": {
    "startCommand": "npm run prisma:migrate:deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Nota:** Esta abordagem executa migrações a cada deploy. Para produção, prefira a Opção A.

### 5.3. Opção C: Via Railway Dashboard (One-time)

1. No serviço da aplicação, vá em **Settings**
2. Role até **"Deploy"**
3. Em **"Deploy Command"**, adicione:
   ```bash
   npm run prisma:generate && npm run prisma:migrate:deploy && npm run build
   ```
4. Salve e faça um novo deploy

**⚠️ Atenção:** Esta opção executa migrações a cada build. Use apenas para setup inicial.

## 🚀 Passo 6: Fazer Deploy

### 6.1. Deploy Automático (via Git)

1. Faça push para a branch principal:
   ```bash
   git push origin main
   ```
2. Railway detectará automaticamente e iniciará o build
3. Acompanhe o progresso em **Deployments**

### 6.2. Deploy Manual

1. No Railway Dashboard, vá em **Deployments**
2. Clique em **"Redeploy"** no último deployment
3. Ou use Railway CLI:
   ```bash
   railway up
   ```

### 6.3. Verificar Logs

1. No serviço, vá em **Deployments**
2. Clique no deployment mais recente
3. Veja os logs em tempo real
4. Procure por erros ou avisos

## ✅ Passo 7: Verificar Deploy

### 7.1. Verificar Aplicação

1. Acesse a URL do projeto (em **Settings** → **Domains**)
2. Verifique se a aplicação carrega corretamente
3. Teste funcionalidades básicas:
   - Cadastro/Login
   - Upload de arquivo
   - Download de arquivo

### 7.2. Verificar Banco de Dados

```bash
# Via Railway CLI
railway run npx prisma studio
```

Ou conecte diretamente:

```bash
railway run psql $DATABASE_URL
```

### 7.3. Verificar Volume

```bash
# Via Railway CLI
railway run ls -la /data/uploads
```

## 🔄 Passo 8: Configurar Domínio Customizado (Opcional)

### 8.1. Adicionar Domínio

1. No serviço, vá em **Settings**
2. Role até **"Domains"**
3. Clique em **"Generate Domain"** ou **"Custom Domain"**
4. Para domínio customizado:
   - Adicione o domínio
   - Configure os registros DNS conforme instruções
   - Aguarde a verificação

### 8.2. Atualizar AUTH_URL

Após configurar o domínio, atualize a variável `AUTH_URL` ou `NEXTAUTH_URL`:

```
https://seu-dominio.com
```

## 🔒 Passo 9: Segurança e Boas Práticas

### 9.1. Segurança de Variáveis

- ✅ **NUNCA** commite variáveis de ambiente no Git
- ✅ Use secrets fortes para `AUTH_SECRET` (mínimo 32 caracteres)
- ✅ Rotacione secrets periodicamente em produção
- ✅ Use HTTPS sempre (Railway fornece automaticamente)

### 9.2. Rate Limiting

A aplicação já implementa rate limiting. Verifique os limites em:

- `lib/security/rate-limit.ts`

### 9.3. Headers de Segurança

A aplicação já inclui headers de segurança. Verifique em:

- `lib/security/headers.ts`

### 9.4. Validação de Arquivos

Uploads são validados automaticamente:

- Tipos MIME permitidos
- Tamanho máximo
- Sanitização de nomes

## 💾 Passo 10: Backups

### 10.1. Backup do Banco de Dados

#### Opção A: Via Railway (Automático)

Railway faz backups automáticos do PostgreSQL. Para restaurar:

1. No serviço PostgreSQL, vá em **Data**
2. Clique em **"Backups"**
3. Selecione um backup e restaure

#### Opção B: Backup Manual

```bash
# Via Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Restaurar
railway run psql $DATABASE_URL < backup.sql
```

#### Opção C: Script Automatizado

Crie um script `scripts/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

railway run pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload para S3, Google Drive, etc.
# aws s3 cp $BACKUP_FILE s3://seu-bucket/backups/
```

### 10.2. Backup do Volume (Arquivos)

#### Opção A: Via Railway CLI

```bash
# Criar backup do volume
railway run tar -czf /tmp/uploads-backup.tar.gz /data/uploads

# Download do backup
railway run cat /tmp/uploads-backup.tar.gz > uploads-backup.tar.gz
```

#### Opção B: Script Automatizado

Crie um script `scripts/backup-uploads.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="uploads-backup-${DATE}.tar.gz"

railway run tar -czf /tmp/$BACKUP_FILE /data/uploads
railway run cat /tmp/$BACKUP_FILE > $BACKUP_FILE

# Upload para storage externo
# aws s3 cp $BACKUP_FILE s3://seu-bucket/uploads-backups/
```

#### Opção C: Sincronização com S3

Para produção, considere usar S3 ou similar:

1. Configure variável `AWS_*` no Railway
2. Modifique `app/actions/upload.ts` para usar S3
3. Mantenha volume apenas como cache local

### 10.3. Frequência de Backups

**Recomendado:**

- **Banco de Dados**: Diário (Railway faz automaticamente)
- **Arquivos**: Semanal ou conforme necessidade
- **Retenção**: Mínimo 30 dias, ideal 90 dias

## 🐛 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"

**Solução:**

1. Verifique se a variável está configurada em **Variables**
2. Certifique-se de que não há espaços extras
3. Faça um novo deploy após adicionar variáveis

### Erro: "Prisma Client not generated"

**Solução:**

```bash
railway run npm run prisma:generate
```

### Erro: "Migration failed"

**Solução:**

1. Verifique os logs do deployment
2. Execute migrações manualmente:
   ```bash
   railway run npm run prisma:migrate:deploy
   ```
3. Verifique se o banco está acessível

### Erro: "Cannot write to /data/uploads"

**Solução:**

1. Verifique se o volume está montado corretamente
2. Confirme o mount path em **Settings** → **Volumes**
3. Verifique permissões:
   ```bash
   railway run ls -la /data
   ```

### Erro: "Invalid AUTH_SECRET"

**Solução:**

1. Gere um novo secret:
   ```bash
   openssl rand -base64 32
   ```
2. Atualize a variável no Railway
3. Faça um novo deploy

### Aplicação não inicia

**Solução:**

1. Verifique os logs em **Deployments**
2. Confirme que todas as variáveis obrigatórias estão configuradas
3. Verifique se o build foi bem-sucedido
4. Teste localmente com as mesmas variáveis

### Arquivos não persistem após redeploy

**Solução:**

1. Certifique-se de que o volume está montado
2. Verifique se `RAILWAY_VOLUME_PATH` está configurado
3. Confirme que os arquivos estão sendo salvos em `/data/uploads`

## 📊 Monitoramento

### 10.1. Logs em Tempo Real

```bash
# Via Railway CLI
railway logs --follow
```

Ou no Dashboard: **Deployments** → Clique no deployment → **View Logs**

### 10.2. Métricas

Railway fornece métricas básicas:

- CPU Usage
- Memory Usage
- Network I/O

Acesse em **Metrics** no serviço.

### 10.3. Alertas

Configure alertas em **Settings** → **Alerts**:

- CPU acima de 80%
- Memória acima de 80%
- Falhas de deploy

## 🔄 Atualizações e Manutenção

### Atualizar Aplicação

```bash
# Fazer alterações no código
git add .
git commit -m "Atualização"
git push origin main

# Railway fará deploy automaticamente
```

### Atualizar Dependências

```bash
# Localmente
npm update

# Testar
npm run build

# Commit e push
git add package*.json
git commit -m "Atualizar dependências"
git push origin main
```

### Executar Migrações Novas

```bash
# Criar migration localmente
npm run prisma:migrate

# Commit migration
git add prisma/migrations/
git commit -m "Nova migration"
git push origin main

# Executar no Railway
railway run npm run prisma:migrate:deploy
```

## 📝 Checklist de Deploy

Use este checklist para garantir que tudo está configurado:

- [ ] Projeto criado no Railway
- [ ] Serviço PostgreSQL criado e `DATABASE_URL` copiado
- [ ] Volume criado e montado em `/data/uploads`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `DATABASE_URL`
  - [ ] `AUTH_SECRET` ou `NEXTAUTH_SECRET`
  - [ ] `AUTH_URL` ou `NEXTAUTH_URL`
  - [ ] `RAILWAY_VOLUME_PATH`
  - [ ] `NODE_ENV=production`
- [ ] Migrações executadas (`prisma migrate deploy`)
- [ ] Deploy bem-sucedido
- [ ] Aplicação acessível e funcional
- [ ] Upload de arquivos funcionando
- [ ] Download de arquivos funcionando
- [ ] Backups configurados (opcional mas recomendado)

## 🆘 Suporte

- **Documentação Railway**: https://docs.railway.app
- **Status Railway**: https://status.railway.app
- **Discord Railway**: https://discord.gg/railway

## 📚 Referências

- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth Deployment](https://next-auth.js.org/deployment)

---

**Última atualização:** 2024-11-24
