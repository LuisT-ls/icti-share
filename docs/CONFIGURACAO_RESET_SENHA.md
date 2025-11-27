# 🔐 Guia de Configuração - Sistema de Recuperação de Senha

Este documento explica como configurar e testar o sistema de recuperação de senha usando Resend.

---

## 📋 Pré-requisitos

- Conta no [Resend](https://resend.com) (gratuita até 3.000 emails/mês)
- Domínio verificado no Resend (ou usar domínio de teste)
- Variáveis de ambiente configuradas

---

## 🚀 Passo a Passo de Configuração

### 1. Criar Conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Clique em **"Sign Up"** e crie uma conta gratuita
3. Confirme seu email

### 2. Obter API Key

1. Após fazer login, vá para **"API Keys"** no menu lateral
2. Clique em **"Create API Key"**
3. Dê um nome descritivo (ex: "ICTI Share Production")
4. Selecione as permissões:
   - ✅ **Send emails** (obrigatório)
   - ✅ **Read API keys** (opcional, para gerenciamento)
5. Clique em **"Add"**
6. **IMPORTANTE:** Copie a API Key imediatamente (ela só é mostrada uma vez!)
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Configurar Domínio

#### ✅ Opção Recomendada: Usar Domínio de Teste (Funciona Imediatamente)

**Você NÃO precisa verificar um domínio!** O Resend fornece um domínio de teste que funciona imediatamente:

1. No Resend, vá para **"Domains"**
2. Você verá o domínio de teste: `resend.dev` (já disponível)
3. **IMPORTANTE:** Para receber emails de teste, você precisa adicionar os emails de destino:
   - Clique em `resend.dev`
   - Vá para a aba **"Test Recipients"**
   - Clique em **"Add Recipient"**
   - Adicione os emails que você quer usar para testar (ex: seu email pessoal)
   - Salve

4. Use o email remetente: `onboarding@resend.dev` (ou qualquer email com `@resend.dev`)

**Vantagens:**

- ✅ Funciona imediatamente, sem configuração DNS
- ✅ Perfeito para desenvolvimento e testes
- ✅ Gratuito
- ✅ Pode usar em produção se não tiver domínio próprio

**Limitação:**

- ⚠️ Só envia para emails adicionados em "Test Recipients"
- ⚠️ Emails podem ir para spam (mas funcionam)

#### Opção Alternativa: Usar Domínio Próprio (Opcional, para Produção)

Se você tiver um domínio próprio e quiser usar em produção:

1. No Resend, vá para **"Domains"**
2. Clique em **"Add Domain"**
3. Digite seu domínio (ex: `seu-dominio.com`)
4. Siga as instruções para adicionar os registros DNS:
   - **SPF Record** (TXT)
   - **DKIM Records** (CNAME)
   - **DMARC Record** (TXT) - opcional mas recomendado
5. Aguarde a verificação (pode levar alguns minutos)
6. Após verificado, você pode usar emails como `noreply@seu-dominio.com`

**Nota:** Se você usa Vercel, o domínio `.vercel.app` não pode ser verificado. Use `resend.dev` ou um domínio próprio.

### 4. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email remetente (use resend.dev para testes, ou seu domínio se verificado)
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=ICTI Share

# URL Base da Aplicação (para links no email)
# Em desenvolvimento:
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Em produção (Vercel):
# NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

**Explicação das variáveis:**

- `RESEND_API_KEY`: API Key obtida no passo 2 (obrigatório)
- `RESEND_FROM_EMAIL`: Email remetente
  - Para testes: `onboarding@resend.dev` (funciona imediatamente)
  - Para produção: `noreply@seu-dominio.com` (se tiver domínio verificado)
- `RESEND_FROM_NAME`: Nome que aparece como remetente (opcional)
- `NEXT_PUBLIC_APP_URL`: URL base da aplicação (usado nos links do email)
  - Desenvolvimento: `http://localhost:3000`
  - Produção: URL da Vercel ou seu domínio

### 5. Instalar Dependências

As dependências já foram instaladas, mas caso precise reinstalar:

```bash
npm install resend
```

### 6. Gerar Prisma Client

Certifique-se de que o Prisma Client está atualizado:

```bash
npm run prisma:generate
```

---

## 🧪 Como Testar

### Teste 1: Verificar Configuração Básica

1. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3000/login`

3. Clique em **"Esqueceu sua senha?"**

4. Digite um email válido cadastrado no sistema

5. Clique em **"Enviar Link de Recuperação"**

6. Verifique:
   - ✅ Mensagem de sucesso aparece
   - ✅ Email é enviado (verifique a caixa de entrada e spam)
   - ✅ Link no email funciona

### Teste 2: Testar Fluxo Completo

1. **Solicitar recuperação:**
   - Acesse `/forgot-password`
   - Digite um email cadastrado
   - Envie o formulário

2. **Verificar email:**
   - Abra o email recebido
   - Verifique se o link está correto
   - Clique no link ou copie e cole no navegador

3. **Redefinir senha:**
   - Você será redirecionado para `/reset-password?token=...`
   - Digite uma nova senha (mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo)
   - Confirme a senha
   - Clique em **"Redefinir Senha"**

4. **Fazer login:**
   - Você será redirecionado para `/login`
   - Faça login com a nova senha
   - ✅ Login deve funcionar

### Teste 3: Validar Segurança

1. **Token expirado:**
   - Solicite um link de recuperação
   - Aguarde mais de 1 hora (ou modifique o código para expiração mais curta)
   - Tente usar o link
   - ✅ Deve mostrar erro "Token expirado"

2. **Token inválido:**
   - Acesse `/reset-password?token=token-invalido`
   - ✅ Deve mostrar erro "Token inválido"

3. **Token usado:**
   - Use um token para redefinir senha
   - Tente usar o mesmo token novamente
   - ✅ Deve mostrar erro "Token inválido"

4. **Rate limiting:**
   - Tente solicitar recuperação várias vezes rapidamente
   - ✅ Após 5 tentativas em 15 minutos, deve bloquear

### Teste 4: Testar em Produção

1. Configure as variáveis de ambiente no seu provedor (Vercel, Railway, etc.)

2. Faça deploy da aplicação

3. Teste o fluxo completo em produção

4. Verifique logs:
   - No Resend: Dashboard → Emails → Ver emails enviados
   - Na aplicação: Logs do servidor para erros

---

## 🔍 Troubleshooting

### Problema: Email não está sendo enviado

**Possíveis causas:**

1. **API Key incorreta:**
   - Verifique se `RESEND_API_KEY` está correto no `.env`
   - Verifique se não há espaços extras
   - Tente criar uma nova API Key

2. **Email de destino não adicionado (resend.dev):**
   - ⚠️ **IMPORTANTE:** Se usar `resend.dev`, você DEVE adicionar o email de destino em "Test Recipients"
   - Acesse: Resend Dashboard → Domains → resend.dev → Test Recipients
   - Clique em "Add Recipient" e adicione o email que você quer receber
   - Sem isso, o email não será enviado!

3. **Domínio não verificado (se usar domínio próprio):**
   - Se usar domínio próprio, verifique se está verificado no Resend
   - Verifique os registros DNS
   - **Solução rápida:** Use `resend.dev` que não precisa verificação

4. **Email remetente incorreto:**
   - Se usar `resend.dev`, use `onboarding@resend.dev` ou qualquer email com `@resend.dev`
   - Não use emails de domínios não verificados

5. **Variável de ambiente não carregada:**
   - Reinicie o servidor após adicionar variáveis
   - Verifique se o arquivo `.env` está na raiz do projeto
   - Em produção, verifique se as variáveis estão configuradas no provedor

**Solução:**

```bash
# Verificar se a variável está carregada
node -e "console.log(process.env.RESEND_API_KEY ? 'OK' : 'FALTANDO')"
```

### Problema: Link no email não funciona

**Possíveis causas:**

1. **URL base incorreta:**
   - Verifique `NEXT_PUBLIC_APP_URL` no `.env`
   - Em produção, use a URL completa (ex: `https://icti-share.vercel.app`)

2. **Token não está sendo passado:**
   - Verifique o console do navegador
   - Verifique se o token está na URL: `/reset-password?token=...`

**Solução:**

- Verifique os logs do servidor
- Teste o link manualmente copiando e colando no navegador

### Problema: Token expira muito rápido

**Solução:**

- Por padrão, tokens expiram em 1 hora
- Para alterar, edite `app/actions/auth.ts`:
  ```typescript
  // Linha ~180
  expires.setHours(expires.getHours() + 1); // Altere o número 1
  ```

### Problema: Email vai para spam

**Soluções:**

1. **Configurar SPF, DKIM e DMARC:**
   - Use domínio próprio verificado
   - Configure todos os registros DNS corretamente

2. **Usar domínio confiável:**
   - Evite usar domínios de teste em produção
   - Use domínio próprio com boa reputação

3. **Conteúdo do email:**
   - O template já está otimizado, mas você pode personalizar em `lib/email.ts`

---

## 📧 Personalizar Email

Para personalizar o template do email, edite o arquivo `lib/email.ts`:

```typescript
// Linha ~40
html: `
  <!DOCTYPE html>
  <html>
    <!-- Seu HTML personalizado aqui -->
  </html>
`,
```

---

## 🔒 Segurança

O sistema implementa as seguintes medidas de segurança:

- ✅ **Tokens seguros:** Gerados com `randomBytes(32)` (256 bits)
- ✅ **Expiração:** Tokens expiram em 1 hora
- ✅ **Uso único:** Tokens são deletados após uso
- ✅ **Rate limiting:** 5 tentativas por 15 minutos
- ✅ **Proteção contra enumeração:** Sempre retorna sucesso (não revela se email existe)
- ✅ **Validação de senha:** Requisitos fortes (8+ caracteres, maiúscula, minúscula, número, símbolo)
- ✅ **Sanitização:** Todos os inputs são sanitizados

---

## 📊 Monitoramento

### No Resend Dashboard

1. Acesse [Resend Dashboard](https://resend.com/emails)
2. Veja estatísticas:
   - Emails enviados
   - Taxa de entrega
   - Taxa de abertura (se configurado)
   - Erros

### Logs da Aplicação

Monitore os logs do servidor para:

- Erros ao enviar emails
- Tentativas de reset
- Tokens inválidos/expirados

---

## ✅ Checklist de Configuração

- [ ] Conta criada no Resend
- [ ] API Key obtida e configurada
- [ ] Domínio verificado (ou usando resend.dev para testes)
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Prisma Client gerado
- [ ] Migration aplicada
- [ ] Teste básico realizado
- [ ] Fluxo completo testado
- [ ] Testes de segurança realizados
- [ ] Configurado em produção (se aplicável)

---

## 🆘 Suporte

- **Documentação Resend:** [https://resend.com/docs](https://resend.com/docs)
- **Status Resend:** [https://status.resend.com](https://status.resend.com)
- **Suporte Resend:** support@resend.com

---

**Última atualização:** 2025-01-27
