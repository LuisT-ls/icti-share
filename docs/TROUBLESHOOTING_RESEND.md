# 🔧 Troubleshooting - Erro 403 no Resend

## Erro: "Erro ao enviar email. Tente novamente mais tarde." (403)

O erro 403 (Forbidden) geralmente indica um problema de autenticação ou permissão. Siga estes passos:

---

## ✅ Checklist de Verificação

### 1. Verificar API Key

**Problema:** API Key inválida, expirada ou sem permissões.

**Solução:**

1. Acesse Resend Dashboard → **API Keys**
2. Verifique se a API Key está ativa
3. Verifique se tem permissão **"Send emails"**
4. Se necessário, crie uma nova API Key
5. Atualize no `.env`:
   ```env
   RESEND_API_KEY=re_nova_api_key_aqui
   ```
6. **Reinicie o servidor** após alterar

**Como verificar se a API Key está sendo carregada:**

- Verifique os logs do servidor ao iniciar
- Deve aparecer: `📧 Tentando enviar email:` (em desenvolvimento)

---

### 2. Verificar Email Remetente

**Problema:** Email remetente incorreto ou não autorizado.

**Solução:**

- Se usar `resend.dev`, use exatamente: `onboarding@resend.dev`
- Verifique no `.env`:
  ```env
  RESEND_FROM_EMAIL=onboarding@resend.dev
  ```
- **Não use** emails de domínios não verificados (ex: `@vercel.app`)

---

### 3. Adicionar Email de Destino (resend.dev)

**Problema:** Se usar `resend.dev`, você DEVE adicionar o email de destino.

**Solução:**

1. Resend Dashboard → **Domains**
2. Clique em **`resend.dev`** (se não aparecer, é normal - use mesmo assim)
3. Vá para a aba **"Test Recipients"**
4. Clique em **"Add Recipient"**
5. Adicione o email que você quer receber (ex: `luisps4.lt@gmail.com`)
6. Salve

**IMPORTANTE:** Sem isso, o Resend rejeita o envio com 403!

---

### 4. Verificar Variáveis de Ambiente

**Problema:** Variáveis não estão sendo carregadas.

**Solução:**

1. Verifique se o arquivo `.env` ou `.env.local` está na **raiz do projeto**
2. Verifique se não há espaços extras:

   ```env
   # ❌ ERRADO
   RESEND_API_KEY = re_xxx

   # ✅ CORRETO
   RESEND_API_KEY=re_xxx
   ```

3. **Reinicie o servidor** após alterar `.env`
4. Em produção (Vercel), verifique em Settings → Environment Variables

**Teste rápido:**

```bash
# No terminal, dentro do projeto
node -e "require('dotenv').config(); console.log('API Key:', process.env.RESEND_API_KEY ? 'OK' : 'FALTANDO')"
```

---

### 5. Verificar Logs do Servidor

**Problema:** Erros não estão sendo exibidos claramente.

**Solução:**

1. Verifique o **terminal do servidor** (não o console do navegador)
2. Procure por mensagens como:
   - `❌ Erro detalhado do Resend:`
   - `📧 Tentando enviar email:`
3. Os logs mostram o erro específico do Resend

---

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar Configuração Básica

```bash
# 1. Verificar se as variáveis estão no .env
cat .env | grep RESEND

# Deve mostrar:
# RESEND_API_KEY=re_xxx
# RESEND_FROM_EMAIL=onboarding@resend.dev
# RESEND_FROM_NAME=ICTI Share
```

### Passo 2: Testar API Key

1. Acesse: https://resend.com/api-keys
2. Verifique se a API Key está **ativa** (não deletada)
3. Verifique se tem permissão **"Send emails"**

### Passo 3: Verificar Email de Destino

1. Acesse: https://resend.com/domains
2. Se usar `resend.dev`, adicione o email em "Test Recipients"
3. O email que você está testando DEVE estar na lista

### Passo 4: Testar com Logs Detalhados

1. Reinicie o servidor: `npm run dev`
2. Tente enviar o email novamente
3. Verifique o **terminal do servidor** (não o navegador)
4. Procure por mensagens de erro detalhadas

---

## 🚨 Erros Comuns e Soluções

### Erro: "Invalid API key"

**Causa:** API Key incorreta ou expirada  
**Solução:** Crie uma nova API Key e atualize `.env`

### Erro: "Domain not verified"

**Causa:** Tentando usar domínio não verificado  
**Solução:** Use `onboarding@resend.dev` ou verifique seu domínio

### Erro: "Forbidden" ou 403

**Causa:** Email de destino não autorizado (resend.dev)  
**Solução:** Adicione o email em "Test Recipients"

### Erro: "Rate limit exceeded"

**Causa:** Muitas tentativas  
**Solução:** Aguarde alguns minutos e tente novamente

---

## ✅ Configuração Correta (Exemplo)

```env
# .env ou .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=ICTI Share
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**No Resend Dashboard:**

- ✅ API Key criada e ativa
- ✅ Email de destino adicionado em "Test Recipients" (se usar resend.dev)
- ✅ Permissão "Send emails" habilitada

---

## 🧪 Teste Rápido

1. **Verificar variáveis:**

   ```bash
   npm run dev
   # Procure por: "📧 Tentando enviar email:" nos logs
   ```

2. **Testar envio:**
   - Acesse `/forgot-password`
   - Use um email que você adicionou em "Test Recipients"
   - Verifique o terminal do servidor para erros detalhados

3. **Verificar Resend Dashboard:**
   - Vá em **Emails** → Veja se o email foi enviado
   - Se aparecer erro, veja os detalhes

---

## 📞 Ainda com Problemas?

1. **Verifique os logs do servidor** (terminal, não navegador)
2. **Verifique o Resend Dashboard** → Emails → Veja erros detalhados
3. **Teste a API Key diretamente:**
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H "Authorization: Bearer re_sua_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "seu-email@exemplo.com",
       "subject": "Teste",
       "html": "<p>Teste</p>"
     }'
   ```

---

**Última atualização:** 2025-01-27
