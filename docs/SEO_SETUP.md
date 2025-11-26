# Configuração de SEO e Compartilhamento Social

Este documento descreve as melhorias de SEO implementadas na aplicação ICTI Share.

## 📋 Funcionalidades Implementadas

### 1. Metadados Globais (app/layout.tsx)

- **Open Graph** para compartilhamento no Facebook, WhatsApp, LinkedIn
- **Twitter Cards** para compartilhamento no Twitter/X
- **Metadados básicos** (title, description, keywords)
- **Robots** e **Sitemap** configurados

### 2. Metadados Dinâmicos por Página

#### Página Inicial (`app/page.tsx`)

- Metadados específicos com Open Graph e Twitter Cards
- Structured Data (JSON-LD) do tipo `WebApplication`

#### Página de Materiais (`app/materiais/page.tsx`)

- Metadados otimizados para busca
- Structured Data do tipo `CollectionPage`

#### Página de Material Individual (`app/material/[id]/page.tsx`)

- Metadados dinâmicos baseados no material
- Structured Data do tipo `LearningResource`
- Informações do autor e data de publicação

### 3. Arquivos de SEO

#### `app/robots.ts`

- Configuração de quais páginas os bots podem indexar
- Bloqueio de páginas privadas (admin, upload, perfil, etc.)

#### `app/sitemap.ts`

- Geração automática de sitemap XML
- Inclui páginas estáticas e materiais aprovados
- Atualização automática baseada no banco de dados

#### `lib/seo.ts`

- Helpers reutilizáveis para gerar metadados
- Funções para Open Graph, Twitter Cards e Structured Data

## 🖼️ Imagem de Compartilhamento Social

### Opção 1: Imagem Estática (Recomendado)

Crie uma imagem estática em `public/og-image.jpg` (ou `og-image.png`) com as seguintes especificações:

- **Dimensões**: 1200x630 pixels
- **Formato**: PNG ou JPG
- **Conteúdo sugerido**:
  - Logo da ICTI Share
  - Título: "ICTI Share"
  - Subtítulo: "Plataforma de Compartilhamento de Materiais Acadêmicos"
  - Design moderno e profissional

### Opção 2: Imagem Dinâmica (Avançado)

Para gerar imagens dinamicamente, você pode:

1. Instalar o pacote `@vercel/og`:

```bash
npm install @vercel/og
```

2. Atualizar `app/opengraph-image.tsx` para usar a API de ImageResponse

## 🔧 Configuração de Variáveis de Ambiente

Certifique-se de ter as seguintes variáveis configuradas:

```env
# URL base da aplicação (usado nos metadados)
NEXT_PUBLIC_APP_URL=https://icti-share.vercel.app
# ou
AUTH_URL=https://icti-share.vercel.app
# ou
NEXTAUTH_URL=https://icti-share.vercel.app
```

A aplicação tentará usar essas variáveis na seguinte ordem:

1. `NEXT_PUBLIC_APP_URL`
2. `AUTH_URL`
3. `NEXTAUTH_URL`
4. Fallback: `https://icti-share.vercel.app`

## ✅ Testando os Metadados

### 1. Teste de Open Graph (WhatsApp/Facebook)

Use a ferramenta do Facebook:

- https://developers.facebook.com/tools/debug/

Cole a URL do seu site e verifique os metadados.

### 2. Teste de Twitter Cards

Use a ferramenta do Twitter:

- https://cards-dev.twitter.com/validator

### 3. Teste de Structured Data

Use o Google Rich Results Test:

- https://search.google.com/test/rich-results

### 4. Verificar Sitemap

Acesse: `https://seu-dominio.com/sitemap.xml`

### 5. Verificar Robots.txt

Acesse: `https://seu-dominio.com/robots.txt`

## 📊 Benefícios

- ✅ Melhor indexação pelos motores de busca
- ✅ Preview rico ao compartilhar links no WhatsApp, Facebook, Twitter
- ✅ Melhor experiência do usuário ao compartilhar
- ✅ Maior visibilidade nos resultados de busca
- ✅ Structured Data ajuda o Google a entender o conteúdo

## 🚀 Próximos Passos (Opcional)

1. **Google Search Console**: Configure para monitorar o desempenho
2. **Google Analytics**: Adicione para rastrear visitantes
3. **Verificação de propriedade**: Adicione códigos de verificação nos metadados
4. **Imagens dinâmicas**: Implemente geração dinâmica de imagens por material
5. **Canonical URLs**: Adicione URLs canônicas para evitar conteúdo duplicado
