# 🔒 Documentação de Segurança

Este documento descreve as medidas de segurança implementadas no projeto ICTI Share.

## 📋 Índice

1. [Sanitização de Inputs](#sanitização-de-inputs)
2. [Rate Limiting](#rate-limiting)
3. [Proteção CSRF](#proteção-csrf)
4. [Headers de Segurança](#headers-de-segurança)
5. [Validação de Arquivos](#validação-de-arquivos)
6. [Proteção contra SQL Injection](#proteção-contra-sql-injection)
7. [Configurações](#configurações)

---

## 🛡️ Sanitização de Inputs

### Implementação

Todos os inputs do usuário são sanitizados antes de serem processados ou armazenados no banco de dados.

**Localização:** `lib/security/sanitize.ts`

### Funções Disponíveis

- `sanitizeString(input: string)`: Remove caracteres perigosos e tags HTML
- `sanitizeObject<T>(obj: T)`: Sanitiza todos os campos string de um objeto
- `sanitizeFilename(filename: string)`: Sanitiza nomes de arquivo
- `sanitizeEmail(email: string)`: Normaliza e sanitiza emails

### Onde é Aplicado

- ✅ Formulários de autenticação (signup/login)
- ✅ Upload de materiais
- ✅ Edição de materiais
- ✅ Edição de perfil

### Exemplo de Uso

```typescript
import { sanitizeString } from "@/lib/security/sanitize";

const userInput = formData.get("title") as string;
const sanitized = sanitizeString(userInput); // Remove caracteres perigosos
```

---

## ⏱️ Rate Limiting

### Implementação

Sistema de rate limiting em memória para prevenir abuso de endpoints críticos.

**Localização:** `lib/security/rate-limit.ts`

### Configurações Pré-definidas

```typescript
AUTH: {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,           // 5 tentativas
}

DOWNLOAD: {
  windowMs: 60 * 1000,       // 1 minuto
  maxRequests: 20,           // 20 downloads
}

UPLOAD: {
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 5,           // 5 uploads
}
```

### Endpoints Protegidos

- ✅ `/app/actions/auth.ts` - Login e Signup (5 tentativas / 15 min)
- ✅ `/app/material/download/[id]/route.ts` - Downloads (20 / minuto)
- ✅ `/app/actions/upload.ts` - Uploads (5 / hora)

### Identificação

O rate limiting identifica usuários por:
- **IP** (para usuários não autenticados)
- **User ID** (para usuários autenticados - mais restritivo)

### Resposta ao Exceder Limite

```json
{
  "error": "Muitas requisições. Tente novamente mais tarde.",
  "status": 429
}
```

Headers incluídos:
- `Retry-After`: Tempo em segundos até poder tentar novamente
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Timestamp de reset

### ⚠️ Nota para Produção

O rate limiting atual usa armazenamento em memória (Map). Para produção com múltiplos servidores, considere usar:
- **Redis** para armazenamento distribuído
- **Upstash Rate Limit** (solução gerenciada)
- **Vercel Edge Config** (se hospedado na Vercel)

---

## 🔐 Proteção CSRF

### Implementação

A proteção CSRF é gerenciada automaticamente pelo **NextAuth v5**.

### Como Funciona

- NextAuth gera tokens CSRF únicos por sessão
- Tokens são validados automaticamente em todas as requisições autenticadas
- Server Actions do Next.js têm proteção CSRF nativa

### Verificação

✅ **Não é necessário implementar manualmente** - NextAuth cuida disso automaticamente.

---

## 🛡️ Headers de Segurança

### Implementação

Headers de segurança são aplicados em todas as respostas via middleware.

**Localização:** `lib/security/headers.ts` e `middleware.ts`

### Headers Configurados

| Header | Valor | Descrição |
|--------|-------|-----------|
| `X-Frame-Options` | `DENY` | Previne clickjacking |
| `X-Content-Type-Options` | `nosniff` | Previne MIME type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Habilita proteção XSS (legado) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla informações de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), ...` | Desabilita recursos sensíveis |
| `Content-Security-Policy` | (ver abaixo) | Política de segurança de conteúdo |

### Content Security Policy (CSP)

#### Desenvolvimento
```csp
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
```

#### Produção
```csp
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

### Customização

Para ajustar os headers, edite `lib/security/headers.ts`:

```typescript
export function getSecurityHeaders(): SecurityHeaders {
  const headers: SecurityHeaders = {
    // Adicione ou modifique headers aqui
    "X-Custom-Header": "value",
  };
  return headers;
}
```

---

## 📁 Validação de Arquivos

### Implementação

Validação multi-camada para prevenir upload de arquivos maliciosos.

**Localização:** `lib/security/file-validation.ts`

### Camadas de Validação

1. **Tamanho do Arquivo**
   - Máximo: 25 MB
   - Mínimo: > 0 bytes

2. **Nome do Arquivo**
   - Remove caracteres perigosos (`<>:"|?*` e caracteres de controle)
   - Previne path traversal (`..`, `/`, `\`)
   - Limita tamanho (255 caracteres)

3. **Extensão**
   - Apenas `.pdf` permitido
   - Case-insensitive

4. **MIME Type**
   - Apenas `application/pdf` permitido
   - Validado do header do arquivo

5. **Magic Bytes (Conteúdo)**
   - Verifica os primeiros bytes do arquivo
   - PDF deve começar com `%PDF` (hex: `25504446`)
   - **Previne arquivos com extensão falsa**

### Função de Validação Completa

```typescript
import { validateFile } from "@/lib/security/file-validation";

const result = await validateFile(file);
if (!result.valid) {
  return { error: result.error };
}
```

### Onde é Aplicado

- ✅ Upload de materiais (`app/actions/upload.ts`)

---

## 🗄️ Proteção contra SQL Injection

### Implementação

**Prisma ORM** previne SQL injection automaticamente usando prepared statements.

### Como Funciona

- Prisma usa **parameterized queries** por padrão
- Todos os valores são escapados automaticamente
- Não é necessário sanitizar manualmente para queries Prisma

### Exemplo Seguro

```typescript
// ✅ Seguro - Prisma escapa automaticamente
await prisma.user.findUnique({
  where: { email: userInput }, // Prisma escapa isso
});

// ❌ NUNCA faça isso (não é necessário com Prisma)
// const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

### Boas Práticas

- ✅ Sempre use Prisma para queries
- ✅ Valide inputs com Zod antes de usar no Prisma
- ✅ Sanitize inputs para prevenir XSS (mesmo que Prisma proteja contra SQL injection)

---

## ⚙️ Configurações

### Variáveis de Ambiente

Nenhuma variável de ambiente adicional é necessária para as funcionalidades de segurança básicas.

### Para Produção

#### Rate Limiting Distribuído

Se usar múltiplos servidores, configure Redis:

```env
REDIS_URL=redis://localhost:6379
```

E atualize `lib/security/rate-limit.ts` para usar Redis em vez de Map.

#### Headers Adicionais (HSTS)

Para HTTPS em produção, configure HSTS no servidor/proxy:

```nginx
# Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

```apache
# Apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

---

## 📊 Resumo de Implementações

| Medida | Status | Localização |
|--------|--------|-------------|
| Sanitização de Inputs | ✅ | `lib/security/sanitize.ts` |
| Rate Limiting | ✅ | `lib/security/rate-limit.ts` |
| CSRF Protection | ✅ | NextAuth (automático) |
| Security Headers | ✅ | `lib/security/headers.ts` |
| Validação de Arquivos | ✅ | `lib/security/file-validation.ts` |
| SQL Injection Protection | ✅ | Prisma ORM (automático) |

---

## 🔍 Checklist de Segurança

### Antes de Deploy

- [ ] Verificar que todas as variáveis de ambiente estão configuradas
- [ ] Revisar CSP para garantir que não bloqueia recursos necessários
- [ ] Testar rate limiting em ambiente de staging
- [ ] Verificar que uploads de arquivos estão sendo validados corretamente
- [ ] Confirmar que headers de segurança estão sendo aplicados
- [ ] Testar proteção CSRF (NextAuth)
- [ ] Verificar logs de segurança

### Monitoramento

- [ ] Monitorar tentativas de rate limiting (429 errors)
- [ ] Logs de uploads rejeitados
- [ ] Tentativas de login falhadas
- [ ] Anomalias em downloads

---

## 🐛 Troubleshooting

### Rate Limiting Muito Restritivo

Ajuste os limites em `lib/security/rate-limit.ts`:

```typescript
export const RATE_LIMIT_CONFIGS = {
  AUTH: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10, // Aumentar limite
  },
  // ...
};
```

### CSP Bloqueando Recursos

Ajuste em `lib/security/headers.ts`:

```typescript
function getCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' https://cdn.example.com", // Adicionar origem permitida
    // ...
  ].join("; ");
}
```

### Uploads Sendo Rejeitados

Verifique:
1. Tamanho do arquivo (máx. 25 MB)
2. Tipo MIME (`application/pdf`)
3. Extensão (`.pdf`)
4. Magic bytes (arquivo deve ser PDF válido)

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

---

**Última atualização:** 2024

