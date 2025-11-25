# 🔧 Solução: Erro "Can't reach database server at postgres.railway.internal"

## 🔍 Problema

Ao executar `railway run npm run prisma:migrate:deploy`, você recebe:

```
Error: P1001: Can't reach database server at `postgres.railway.internal:5432`
```

## 💡 Causa

O Railway fornece **duas URLs diferentes** para o PostgreSQL:

1. **`DATABASE_URL`** - URL interna (`postgres.railway.internal:5432`)
   - ✅ Funciona **apenas dentro dos containers** do Railway
   - ❌ **NÃO funciona** do seu terminal local ou via Railway CLI

2. **`DATABASE_PUBLIC_URL`** - URL pública (`switchback.proxy.rlwy.net:28408`)
   - ✅ Funciona **de qualquer lugar** (terminal local, Railway CLI, containers)
   - ✅ **Use esta URL** no serviço da aplicação

## ✅ Solução Rápida

### Passo 1: Obter DATABASE_PUBLIC_URL

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

### Passo 2: Configurar no Serviço da Aplicação

**Via Railway Dashboard (Recomendado):**

1. No Railway Dashboard, vá no serviço **icti-share**
2. Clique na aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Nome: `DATABASE_URL`
5. Valor: Cole a **`DATABASE_PUBLIC_URL`** copiada do PostgreSQL
6. Salve

**Via Railway CLI:**

```bash
# Obter DATABASE_PUBLIC_URL
PUBLIC_URL=$(railway variables | grep DATABASE_PUBLIC_URL | awk '{print $3}')

# Configurar no serviço icti-share
railway variables set DATABASE_URL="$PUBLIC_URL" --service icti-share
```

### Passo 3: Executar Migrações

Agora que a `DATABASE_URL` está configurada com a URL pública:

```bash
# Verificar se está conectado ao serviço correto
railway status

# Executar migrações
railway run npm run prisma:generate
railway run npm run prisma:migrate:deploy
```

**✅ Deve funcionar agora!**

## 🔍 Verificar se Funcionou

```bash
# Verificar tabelas criadas
railway run --service postgres psql $DATABASE_PUBLIC_URL -c "\dt"
```

Ou no Railway Dashboard:

- Vá em **Postgres** → **Database** → **Data**
- Você deve ver as tabelas: `users`, `materials`, `downloads`, etc.

## 📝 Resumo

| URL                      | Quando Usar                      | Funciona Onde                                                |
| ------------------------ | -------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL` (interna) | Dentro dos containers do Railway | ❌ Terminal local<br>❌ Railway CLI<br>✅ Containers Railway |
| `DATABASE_PUBLIC_URL`    | Serviço da aplicação             | ✅ Terminal local<br>✅ Railway CLI<br>✅ Containers Railway |

**Regra de ouro:** Use sempre `DATABASE_PUBLIC_URL` no serviço da aplicação!

---

**Última atualização:** Novembro 2024
