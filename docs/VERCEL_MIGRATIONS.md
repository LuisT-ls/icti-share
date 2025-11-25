# Executar Migrations no Vercel

O Vercel não executa migrations automaticamente. Você precisa executá-las manualmente após o deploy.

## Opção 1: Via Vercel CLI (Recomendado)

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Fazer Login

```bash
vercel login
```

### 3. Conectar ao Projeto

```bash
vercel link
```

### 4. Executar Migrations

```bash
# Gerar Prisma Client
vercel env pull .env.local
vercel exec -- npm run prisma:generate

# Executar migrations
vercel exec -- npm run prisma:migrate:deploy
```

## Opção 2: Via Script de Build (Automático)

O arquivo `vercel.json` já está configurado para executar migrations durante o build:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

**⚠️ Atenção:** Isso executa migrations a cada build. Certifique-se de que todas as migrations estão prontas antes de fazer deploy.

## Opção 3: Via Dashboard do Vercel

1. Acesse o projeto no Vercel Dashboard
2. Vá em **Settings** → **Environment Variables**
3. Certifique-se de que `DATABASE_URL` está configurada
4. Vá em **Deployments** → Seu deployment → **Functions** → **View Logs**
5. Verifique se há erros relacionados ao Prisma

## Verificar se as Migrations Foram Aplicadas

### Via Vercel CLI

```bash
# Conectar ao banco via Vercel
vercel env pull .env.local

# Verificar se o campo course existe
npx prisma studio
# Ou
npx prisma db execute --stdin < <(echo "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'course';")
```

### Via SQL Direto

Se você tiver acesso ao banco PostgreSQL:

```sql
-- Verificar se a coluna course existe
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'course';

-- Se não existir, execute a migration manualmente:
ALTER TABLE "users" ADD COLUMN "course" TEXT;
CREATE INDEX "users_course_idx" ON "users"("course");
```

## Solução de Problemas

### Erro: "No pending migrations to apply"

Isso pode significar:

- ✅ As migrations já foram aplicadas
- ⚠️ O Prisma não está encontrando as migrations (verifique se `prisma/migrations` existe)
- ⚠️ A `DATABASE_URL` está incorreta

### Erro: "Column 'course' does not exist"

A migration não foi aplicada. Execute:

```bash
vercel exec -- npm run prisma:migrate:deploy
```

### Erro: "Prisma Client not generated"

Execute:

```bash
vercel exec -- npm run prisma:generate
```

## Checklist

- [ ] `DATABASE_URL` configurada no Vercel
- [ ] Vercel CLI instalado e autenticado
- [ ] Migrations executadas com sucesso
- [ ] Prisma Client gerado
- [ ] Aplicação funcionando corretamente
