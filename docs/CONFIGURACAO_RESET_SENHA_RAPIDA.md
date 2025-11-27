# 🚀 Configuração Rápida - Reset de Senha (Sem Domínio Próprio)

Guia rápido para configurar o reset de senha usando o domínio de teste do Resend (funciona imediatamente, sem verificação de domínio).

---

## ⚡ Passos Rápidos (5 minutos)

### 1. Criar Conta no Resend

- Acesse: https://resend.com
- Crie conta gratuita (até 3.000 emails/mês)

### 2. Obter API Key

- Dashboard → **API Keys** → **Create API Key**
- Dê um nome (ex: "ICTI Share")
- Copie a chave (formato: `re_...`)

### 3. Adicionar Email de Teste

- Dashboard → **Domains** → Clique em **`resend.dev`**
- Vá para a aba **"Test Recipients"**
- Clique em **"Add Recipient"**
- Adicione o email que você quer usar para receber emails de reset
- Salve

### 4. Configurar Variáveis de Ambiente

No arquivo `.env` (raiz do projeto):

```env
# Resend (obrigatório)
RESEND_API_KEY=re_sua_api_key_aqui

# Email remetente (use resend.dev - funciona sem verificação)
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=ICTI Share

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Em produção (Vercel), use:
# NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

### 5. Reiniciar Servidor

```bash
npm run dev
```

### 6. Testar

1. Acesse: `http://localhost:3000/login`
2. Clique em **"Esqueceu sua senha?"**
3. Digite um email **que você adicionou em "Test Recipients"**
4. Verifique o email recebido
5. Clique no link e redefina a senha

---

## ✅ Pronto!

O sistema está funcionando. Você pode usar `resend.dev` tanto em desenvolvimento quanto em produção.

**Importante:**

- ✅ Funciona imediatamente, sem configuração DNS
- ⚠️ Só envia para emails adicionados em "Test Recipients"
- ⚠️ Emails podem ir para spam (mas funcionam)

---

## 🔄 Para Produção (Opcional)

Se quiser usar um domínio próprio no futuro:

1. Compre um domínio (ex: `icti-share.com`)
2. No Resend: Domains → Add Domain
3. Configure DNS conforme instruções
4. Altere `RESEND_FROM_EMAIL` para `noreply@seu-dominio.com`

Mas não é obrigatório! `resend.dev` funciona perfeitamente.

---

**Dúvidas?** Consulte o guia completo: `CONFIGURACAO_RESET_SENHA.md`
