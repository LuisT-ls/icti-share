# 🔍 Guia Completo: Como Indexar seu Site no Google

Este documento fornece um guia passo a passo detalhado para indexar sua aplicação ICTI Share no Google e torná-la visível nos resultados de busca.

---

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Etapa 1: Verificar Configurações Técnicas](#-etapa-1-verificar-configurações-técnicas)
3. [Etapa 2: Criar Conta no Google Search Console](#-etapa-2-criar-conta-no-google-search-console)
4. [Etapa 3: Verificar Propriedade do Site](#-etapa-3-verificar-propriedade-do-site)
5. [Etapa 4: Enviar Sitemap](#-etapa-4-enviar-sitemap)
6. [Etapa 5: Solicitar Indexação](#-etapa-5-solicitar-indexação)
7. [Etapa 6: Monitorar e Otimizar](#-etapa-6-monitorar-e-otimizar)
8. [Troubleshooting](#-troubleshooting)

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de que:

- ✅ Seu site está **publicamente acessível** na internet (não apenas em localhost)
- ✅ Seu site está **funcionando corretamente** (sem erros 404, 500, etc.)
- ✅ Você tem acesso ao **domínio** onde o site está hospedado
- ✅ Você tem acesso ao **código fonte** para fazer alterações se necessário

**URL do seu site:** `https://icti-share.vercel.app` (ou seu domínio personalizado)

---

## 🔧 Etapa 1: Verificar Configurações Técnicas

Antes de solicitar indexação, verifique se tudo está configurado corretamente.

### 1.1 Verificar robots.txt

Acesse: `https://seu-dominio.com/robots.txt`

**O que verificar:**

- ✅ O arquivo deve estar acessível
- ✅ Deve permitir indexação das páginas públicas
- ✅ Deve bloquear páginas privadas (admin, upload, perfil, etc.)

**Exemplo esperado:**

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /upload/
Disallow: /meus-materiais/
Disallow: /perfil/
Disallow: /login
Disallow: /signup

Sitemap: https://seu-dominio.com/sitemap.xml
```

**✅ Status:** Já configurado em `app/robots.ts`

### 1.2 Verificar Sitemap

Acesse: `https://seu-dominio.com/sitemap.xml`

**O que verificar:**

- ✅ O arquivo deve estar acessível
- ✅ Deve conter URLs das páginas principais
- ✅ Deve incluir materiais aprovados

**✅ Status:** Já configurado em `app/sitemap.ts`

### 1.3 Verificar Metadados SEO

**Verificar no código fonte da página inicial:**

1. Abra `https://seu-dominio.com` no navegador
2. Clique com botão direito → "Ver código-fonte" (ou `Ctrl+U`)
3. Procure por estas tags no `<head>`:

```html
<title>
  ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos
</title>
<meta
  name="description"
  content="Plataforma acadêmica para compartilhamento de materiais de estudo..."
/>
<meta
  property="og:title"
  content="ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos"
/>
<meta
  property="og:description"
  content="Plataforma acadêmica para compartilhamento de materiais de estudo..."
/>
<meta property="og:image" content="https://seu-dominio.com/og-image.jpg" />
```

**✅ Status:** Já configurado em `app/layout.tsx`

### 1.4 Verificar Imagem Open Graph

**Verificar se a imagem existe:**

- Acesse: `https://seu-dominio.com/og-image.jpg`
- A imagem deve carregar corretamente
- Dimensões recomendadas: 1200x630 pixels

**✅ Status:** Já existe em `public/og-image.jpg`

### 1.5 Verificar Variáveis de Ambiente

Certifique-se de que a variável `NEXT_PUBLIC_APP_URL` está configurada corretamente no ambiente de produção:

```env
NEXT_PUBLIC_APP_URL=https://icti-share.vercel.app
```

**Onde verificar:**

- Vercel: Settings → Environment Variables
- Railway: Variables
- Outro provedor: Painel de configurações

---

## 🌐 Etapa 2: Criar Conta no Google Search Console

O Google Search Console é a ferramenta oficial do Google para gerenciar a presença do seu site nos resultados de busca.

### 2.1 Acessar Google Search Console

1. Acesse: https://search.google.com/search-console
2. Faça login com sua conta Google
3. Se for a primeira vez, clique em **"Começar"**

### 2.2 Adicionar Propriedade

1. Clique no botão **"Adicionar propriedade"** (ou "Add property")
2. Escolha o tipo: **"Prefixo do URL"** (recomendado) ou **"Domínio"**
3. Digite a URL do seu site: `https://icti-share.vercel.app`
4. Clique em **"Continuar"**

---

## 🔐 Etapa 3: Verificar Propriedade do Site

O Google precisa verificar que você é o dono do site. Existem várias formas de fazer isso.

### Método 1: Tag HTML (Recomendado - Mais Fácil)

#### Passo 1: Obter o Código de Verificação

1. No Google Search Console, após adicionar a propriedade, você verá várias opções de verificação
2. Escolha **"Tag HTML"**
3. Copie o **conteúdo** da tag `content` (não copie a tag inteira)

**Exemplo:**

```html
<meta name="google-site-verification" content="ABC123XYZ789..." />
```

Você precisa apenas do valor: `ABC123XYZ789...`

#### Passo 2: Adicionar ao Código

1. Abra o arquivo: `app/layout.tsx`
2. Localize a seção `verification` nos metadados (linha ~81)
3. Adicione o código de verificação:

```typescript
verification: {
  google: "ABC123XYZ789...", // Cole aqui o código que você copiou
},
```

#### Passo 3: Fazer Deploy

1. Faça commit das alterações:

   ```bash
   git add app/layout.tsx
   git commit -m "feat: adiciona verificação do Google Search Console"
   git push
   ```

2. Aguarde o deploy ser concluído

#### Passo 4: Verificar no Google

1. Volte ao Google Search Console
2. Clique em **"Verificar"**
3. Se tudo estiver correto, você verá: ✅ **"Propriedade verificada"**

### Método 2: Arquivo HTML (Alternativo)

Se o método 1 não funcionar:

1. No Google Search Console, escolha **"Arquivo HTML"**
2. Baixe o arquivo fornecido (ex: `google1234567890.html`)
3. Coloque o arquivo na pasta `public/` do seu projeto
4. Faça deploy
5. Verifique se o arquivo está acessível: `https://seu-dominio.com/google1234567890.html`
6. Clique em **"Verificar"** no Google Search Console

### Método 3: DNS (Para Domínios Personalizados)

Se você usa um domínio personalizado:

1. No Google Search Console, escolha **"Registro DNS"**
2. Adicione o registro TXT no seu provedor de DNS
3. Aguarde a propagação (pode levar até 48 horas)
4. Clique em **"Verificar"**

---

## 📄 Etapa 4: Enviar Sitemap

O sitemap ajuda o Google a descobrir todas as páginas do seu site.

### 4.1 Encontrar o Sitemap

Seu sitemap está em: `https://seu-dominio.com/sitemap.xml`

**Verifique se está acessível:**

1. Acesse a URL no navegador
2. Você deve ver um XML com as URLs do seu site

### 4.2 Enviar no Google Search Console

1. No Google Search Console, vá para **"Sitemaps"** no menu lateral
2. Em **"Adicionar um novo sitemap"**, digite: `sitemap.xml`
3. Clique em **"Enviar"**

### 4.3 Verificar Status

Após alguns minutos:

- ✅ **"Sucesso"** = Sitemap processado corretamente
- ⚠️ **"Avisos"** = Algumas URLs podem ter problemas (normal)
- ❌ **"Erro"** = Verifique os erros e corrija

**Nota:** O Google pode levar alguns dias para processar todas as URLs do sitemap.

---

## 🚀 Etapa 5: Solicitar Indexação

Agora você pode solicitar que o Google indexe suas páginas principais.

### 5.1 Indexação Manual (Páginas Específicas)

Para páginas importantes que você quer indexar rapidamente:

1. No Google Search Console, vá para **"Inspeção de URL"** (ou "URL Inspection")
2. Digite a URL que deseja indexar (ex: `https://seu-dominio.com`)
3. Clique em **"Testar URL ativa"**
4. Após o teste, clique em **"Solicitar indexação"**
5. Repita para outras páginas importantes:
   - Página inicial: `/`
   - Página de materiais: `/materiais`
   - Alguns materiais específicos: `/material/[id]`

### 5.2 Indexação Automática

O Google também indexa automaticamente quando:

- ✅ Você envia o sitemap (já feito)
- ✅ Outros sites fazem link para o seu site
- ✅ O Google encontra seu site naturalmente

**Dica:** Compartilhe seu site em redes sociais, fóruns, ou outros sites para acelerar a descoberta.

---

## 📊 Etapa 6: Monitorar e Otimizar

Após a indexação inicial, monitore o desempenho e otimize continuamente.

### 6.1 Acompanhar Indexação

**No Google Search Console:**

1. Vá para **"Cobertura"** (ou "Coverage")
2. Veja quantas páginas foram indexadas
3. Verifique se há erros (404, 500, etc.)

**O que esperar:**

- Primeiras páginas indexadas: 1-7 dias
- Indexação completa: 2-4 semanas
- Atualizações regulares: contínuo

### 6.2 Verificar Performance

**No Google Search Console:**

1. Vá para **"Desempenho"** (ou "Performance")
2. Veja:
   - Quantas pessoas encontraram seu site
   - Quais palavras-chave foram usadas
   - Taxa de cliques (CTR)
   - Posição média nos resultados

### 6.3 Melhorar SEO

**Dicas para melhorar a visibilidade:**

1. **Conteúdo de Qualidade**
   - Adicione descrições detalhadas aos materiais
   - Use títulos descritivos
   - Organize o conteúdo com títulos (H1, H2, etc.)

2. **Palavras-chave**
   - Use palavras-chave relevantes naturalmente
   - Exemplos: "materiais acadêmicos", "apostilas", "notas de aula"

3. **Links Internos**
   - Linke páginas relacionadas
   - Facilite a navegação

4. **Velocidade**
   - Otimize imagens
   - Use lazy loading
   - Minimize JavaScript

5. **Mobile-Friendly**
   - Certifique-se de que o site funciona bem no mobile
   - Use o teste: https://search.google.com/test/mobile-friendly

### 6.4 Verificar Indexação no Google

**Teste manual:**

1. Abra o Google
2. Digite: `site:seu-dominio.com`
3. Veja quantas páginas aparecem nos resultados

**Exemplo:**

```
site:icti-share.vercel.app
```

---

## 🔧 Troubleshooting

### Problema: "Propriedade não verificada"

**Soluções:**

1. Verifique se o código de verificação está correto no `layout.tsx`
2. Certifique-se de que fez deploy após adicionar o código
3. Aguarde alguns minutos e tente novamente
4. Use o método alternativo (arquivo HTML)

### Problema: "Sitemap não encontrado"

**Soluções:**

1. Verifique se `https://seu-dominio.com/sitemap.xml` está acessível
2. Verifique se a variável `NEXT_PUBLIC_APP_URL` está configurada
3. Verifique os logs do servidor para erros

### Problema: "Páginas não estão sendo indexadas"

**Soluções:**

1. Verifique se as páginas não estão bloqueadas no `robots.txt`
2. Verifique se as páginas retornam status 200 (não 404 ou 500)
3. Aguarde mais tempo (pode levar semanas)
4. Solicite indexação manualmente para páginas importantes

### Problema: "Erro ao buscar materiais para sitemap"

**Soluções:**

1. Verifique se o banco de dados está acessível
2. Verifique a conexão do Prisma
3. Verifique os logs do servidor

### Problema: "Metadados não aparecem ao compartilhar"

**Soluções:**

1. Use a ferramenta do Facebook: https://developers.facebook.com/tools/debug/
2. Use a ferramenta do Twitter: https://cards-dev.twitter.com/validator
3. Verifique se a imagem `og-image.jpg` existe e está acessível
4. Limpe o cache das ferramentas de debug

---

## 📝 Checklist Final

Use este checklist para garantir que tudo está configurado:

- [ ] Site está publicamente acessível
- [ ] `robots.txt` está acessível e configurado corretamente
- [ ] `sitemap.xml` está acessível e contém URLs
- [ ] Metadados SEO estão configurados no `layout.tsx`
- [ ] Imagem Open Graph (`og-image.jpg`) existe e está acessível
- [ ] Variável `NEXT_PUBLIC_APP_URL` está configurada em produção
- [ ] Conta no Google Search Console criada
- [ ] Propriedade do site verificada
- [ ] Sitemap enviado no Google Search Console
- [ ] Páginas principais solicitadas para indexação
- [ ] Monitoramento configurado

---

## 🎯 Próximos Passos (Opcional)

Após a indexação inicial, considere:

1. **Google Analytics**
   - Adicione para rastrear visitantes
   - Integre com Google Search Console

2. **Google My Business** (se aplicável)
   - Para empresas/organizações locais

3. **Schema Markup Adicional**
   - Adicione mais structured data
   - Exemplos: FAQ, Breadcrumbs, Organization

4. **Backlinks**
   - Consiga links de outros sites
   - Compartilhe em redes sociais
   - Mencione em fóruns relevantes

5. **Conteúdo Regular**
   - Adicione novos materiais regularmente
   - Mantenha o conteúdo atualizado

---

## 📚 Recursos Úteis

- **Google Search Console:** https://search.google.com/search-console
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PageSpeed Insights:** https://pagespeed.web.dev/

---

## ⏱️ Timeline Esperada

- **Verificação do site:** Imediato (após adicionar código)
- **Primeiras páginas indexadas:** 1-7 dias
- **Indexação completa:** 2-4 semanas
- **Aparecer nos resultados de busca:** 1-4 semanas
- **Otimização e melhorias:** Contínuo

---

**Última atualização:** 2024-11-25

**Dúvidas?** Consulte a documentação oficial do Google Search Console ou abra uma issue no repositório.
