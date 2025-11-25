# 🔧 Solução: Erro ao Criar Conta no Vercel

## 🔍 Problema

Ao tentar criar uma conta, você recebe:

- ❌ "Erro ao criar conta. Tente novamente."
- ❌ `GET /api/auth/session 500 (Internal Server Error)`
- ❌ "There was a problem with the server configuration"

## 💡 Causa

As variáveis de ambiente do **NextAuth** não estão configuradas no Vercel:

- `AUTH_SECRET` (ou `NEXTAUTH_SECRET`)
- `AUTH_URL` (ou `NEXTAUTH_URL`)
- `DATABASE_URL`

---

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### Passo 1: Acessar Configurações do Projeto

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **icti-share**
3. Vá em **Settings** → **Environment Variables**

### Passo 2: Adicionar Variáveis Obrigatórias

#### 2.1. AUTH_SECRET

1. Clique em **"Add New"**
2. **Name:** `AUTH_SECRET`
3. **Value:** Gere um secret seguro:
   ```bash
   openssl rand -base64 32
   ```
   Ou use um gerador online: https://generate-secret.vercel.app/32
4. **Environments:** Selecione todas (Production, Preview, Development)
5. Clique em **"Save"**

#### 2.2. AUTH_URL

1. Clique em **"Add New"**
2. **Name:** `AUTH_URL`
3. **Value:** A URL do seu projeto no Vercel:
   ```
   https://icti-share.vercel.app
   ```
   **Nota:** Se você tiver um domínio customizado, use ele.
4. **Environments:** Selecione todas
5. Clique em **"Save"**

#### 2.3. DATABASE_URL

1. Clique em **"Add New"**
2. **Name:** `DATABASE_URL`
3. **Value:** A URL pública do PostgreSQL do Railway:
   ```
   postgresql://postgres:senha@switchback.proxy.rlwy.net:28408/railway
   ```
   **Como obter:**
   - No Railway Dashboard → Serviço **Postgres** → **Variables**
   - Copie o valor de **`DATABASE_PUBLIC_URL`**
4. **Environments:** Selecione todas
5. Clique em **"Save"**

### Passo 3: Fazer Novo Deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos **"..."** (três pontos) do último deployment
3. Selecione **"Redeploy"**
4. Aguarde o deploy concluir

**✅ Após o redeploy, tente criar a conta novamente!**

---

## 🔍 Verificar se Está Funcionando

### 1. Verificar Variáveis Configuradas

No Vercel Dashboard → Settings → Environment Variables, você deve ver:

| Variável       | Valor (parcial)                 | Environments                     |
| -------------- | ------------------------------- | -------------------------------- |
| `AUTH_SECRET`  | `abc123...`                     | Production, Preview, Development |
| `AUTH_URL`     | `https://icti-share.vercel.app` | Production, Preview, Development |
| `DATABASE_URL` | `postgresql://postgres:...`     | Production, Preview, Development |

### 2. Testar Criação de Conta

1. Acesse `https://icti-share.vercel.app/signup`
2. Preencha o formulário
3. Clique em **"Criar conta"**
4. ✅ Deve funcionar agora!

### 3. Verificar Logs

Se ainda houver erro:

1. Vercel Dashboard → Deployments → Último deployment
2. Clique em **"View Function Logs"**
3. Procure por erros relacionados a:
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `DATABASE_URL`
   - `NextAuth`

---

## 🆘 Troubleshooting

### Problema: Ainda recebe erro 500

**Soluções:**

1. Verifique se todas as variáveis foram salvas corretamente
2. Certifique-se de que fez um **Redeploy** após adicionar as variáveis
3. Verifique os logs do Vercel para mais detalhes

### Problema: "Invalid AUTH_SECRET"

**Solução:**

- Gere um novo secret: `openssl rand -base64 32`
- Atualize a variável `AUTH_SECRET` no Vercel
- Faça um novo deploy

### Problema: "Can't reach database server"

**Solução:**

- Verifique se a `DATABASE_URL` está usando a **URL pública** do Railway (`DATABASE_PUBLIC_URL`)
- Não use a URL interna (`postgres.railway.internal`)

### Problema: Aplicação no Railway vs Vercel

**Se você quer usar o Railway ao invés do Vercel:**

1. No Railway Dashboard, configure as variáveis de ambiente
2. Use a URL do Railway para acessar a aplicação
3. Configure `AUTH_URL` com a URL do Railway

---

## 📋 Checklist Final

- [ ] `AUTH_SECRET` configurado no Vercel
- [ ] `AUTH_URL` configurado no Vercel (apontando para URL correta)
- [ ] `DATABASE_URL` configurado no Vercel (usando `DATABASE_PUBLIC_URL` do Railway)
- [ ] Todas as variáveis configuradas para todos os ambientes (Production, Preview, Development)
- [ ] Novo deploy realizado após configurar variáveis
- [ ] É possível criar conta sem erros
- [ ] É possível fazer login

---

## 🔗 Links Úteis

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth Deployment](https://authjs.dev/getting-started/deployment)
- [Railway Database Connection](https://docs.railway.app/databases/postgresql)

---

**Última atualização:** Novembro 2024
