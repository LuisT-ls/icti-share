# 🗄️ Guia Rápido: Criar Tabelas no PostgreSQL do Railway

Este guia mostra como criar as tabelas do banco de dados após o deploy no Railway.

## ✅ Pré-requisitos

- ✅ Deploy da aplicação no Railway concluído
- ✅ Serviço PostgreSQL criado e rodando
- ✅ Railway CLI instalado e autenticado

---

## 🎯 Passo 1: Configurar DATABASE_URL no Serviço da Aplicação

### 1.1. Obter DATABASE_PUBLIC_URL

**Via Railway Dashboard:**

1. No Railway Dashboard, vá no serviço **Postgres**
2. Clique na aba **"Variables"**
3. Copie o valor de **`DATABASE_PUBLIC_URL`**
4. Formato: `postgresql://postgres:senha@switchback.proxy.rlwy.net:28408/railway`

**Via Railway CLI:**

```bash
railway variables
# Procure por DATABASE_PUBLIC_URL
```

### 1.2. Configurar no Serviço icti-share

**Via Railway Dashboard (Recomendado):**

1. No Railway Dashboard, vá no serviço **icti-share**
2. Clique na aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Nome: `DATABASE_URL`
5. Valor: Cole a **`DATABASE_PUBLIC_URL`** copiada do PostgreSQL
6. Salve

**⚠️ IMPORTANTE:** Use a `DATABASE_PUBLIC_URL`, não a `DATABASE_URL` interna!

---

## 🚀 Passo 2: Executar Migrações

### 2.1. Conectar ao Serviço Correto

```bash
# Verificar status atual
railway status

# Se não estiver no serviço icti-share, conecte:
railway service icti-share
```

### 2.2. Executar Migrações

```bash
# Gerar Prisma Client
railway run npm run prisma:generate

# Executar migrações (cria as tabelas)
railway run npm run prisma:migrate:deploy
```

**✅ Se aparecer "Applied migration", as tabelas foram criadas!**

---

## ✅ Passo 3: Verificar se as Tabelas Foram Criadas

### 3.1. Via Railway Dashboard

1. No Railway Dashboard, vá no serviço **Postgres**
2. Clique na aba **"Database"** → **"Data"**
3. Você deve ver as seguintes tabelas:
   - ✅ `users`
   - ✅ `materials`
   - ✅ `downloads`
   - ✅ `accounts`
   - ✅ `sessions`
   - ✅ `verification_tokens`

### 3.2. Via Railway CLI

```bash
# Conectar ao PostgreSQL
railway run --service postgres psql $DATABASE_PUBLIC_URL -c "\dt"
```

**Ou via SQL direto:**

```bash
railway run --service postgres psql $DATABASE_PUBLIC_URL

# Dentro do psql:
\dt                    # Listar tabelas
SELECT COUNT(*) FROM users;  # Verificar se está vazio
\q                     # Sair
```

---

## 👤 Passo 4: Criar Primeiro Usuário Admin (Opcional)

Após criar as tabelas, você pode criar um usuário admin:

### 4.1. Via Interface Web

1. Acesse a URL da aplicação
2. Vá em `/signup`
3. Crie uma conta
4. Depois, altere o role para ADMIN via SQL (Passo 4.2)

### 4.2. Alterar Role para ADMIN via SQL

```bash
# Conectar ao banco
railway run --service postgres psql $DATABASE_PUBLIC_URL

# Alterar role do usuário
UPDATE users SET role = 'ADMIN' WHERE email = 'seu-email@exemplo.com';

# Verificar
SELECT id, email, role FROM users;

# Sair
\q
```

---

## 🆘 Troubleshooting

### Problema: "Can't reach database server"

**Solução:** Certifique-se de que está usando `DATABASE_PUBLIC_URL` no serviço icti-share, não `DATABASE_URL` interna.

### Problema: "No pending migrations to apply"

**Possíveis causas:**

1. ✅ Migrações já foram aplicadas (verifique no Dashboard)
2. ⚠️ DATABASE_URL apontando para banco errado
3. ⚠️ Migrações não encontradas

**Solução:**

```bash
# Verificar qual banco está sendo usado
railway run npm run prisma:migrate:deploy -- --create-only

# Verificar tabelas existentes
railway run --service postgres psql $DATABASE_PUBLIC_URL -c "\dt"
```

### Problema: Tabelas não aparecem no Dashboard

**Solução:**

1. Aguarde alguns segundos (pode haver delay)
2. Recarregue a página
3. Verifique via CLI: `railway run --service postgres psql $DATABASE_PUBLIC_URL -c "\dt"`

---

## 📋 Checklist Final

- [ ] `DATABASE_URL` configurada no serviço **icti-share** (usando `DATABASE_PUBLIC_URL`)
- [ ] Migrações executadas com sucesso
- [ ] Tabelas visíveis no Railway Dashboard → Postgres → Database → Data
- [ ] É possível acessar a aplicação
- [ ] É possível criar conta de usuário
- [ ] Primeiro usuário admin criado (opcional)

---

---

## ⚠️ Nota: Aplicação no Vercel

Se sua aplicação está rodando no **Vercel** (não no Railway), você também precisa configurar as variáveis de ambiente lá:

1. **AUTH_SECRET** - Secret do NextAuth
2. **AUTH_URL** - URL da aplicação no Vercel
3. **DATABASE_URL** - URL pública do PostgreSQL do Railway

**📖 Para mais detalhes, consulte [VERCEL_AUTH_FIX.md](./VERCEL_AUTH_FIX.md)**

---

**Última atualização:** Novembro 2024
