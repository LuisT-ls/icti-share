# Sugestões de Melhorias - PRs e Estimativas

Este documento contém sugestões detalhadas de Pull Requests para implementar as melhorias solicitadas.

---

## 📄 PR #1: Preview de PDF com pdf.js na Página de Detalhes

### Descrição
Implementar visualização de thumbnails/preview de PDFs usando pdf.js (client-side) na página de detalhes do material (`/material/[id]`).

### Objetivos
- Exibir primeira página do PDF como thumbnail/preview
- Permitir visualização completa do PDF em modal/embed
- Melhorar UX ao permitir preview antes do download
- Manter performance com lazy loading

### Arquivos a Modificar/Criar

#### Novos Arquivos
- `components/PDFPreview.tsx` - Componente Client Component para preview
- `components/PDFViewer.tsx` - Componente para visualização completa em modal
- `lib/pdf-utils.ts` - Utilitários para manipulação de PDF (opcional)

#### Arquivos Modificados
- `app/material/[id]/page.tsx` - Adicionar seção de preview
- `package.json` - Adicionar dependência `pdfjs-dist`

### Estrutura Sugerida

```typescript
// components/PDFPreview.tsx
"use client";
// Componente para exibir thumbnail da primeira página
// Usa pdf.js para renderizar canvas

// components/PDFViewer.tsx  
"use client";
// Modal com visualizador completo do PDF
// Navegação entre páginas, zoom, etc.
```

### Dependências
```json
{
  "pdfjs-dist": "^4.0.379"
}
```

### Considerações Técnicas
- **Client Component obrigatório**: pdf.js requer acesso ao DOM
- **Lazy loading**: Carregar PDF apenas quando visível (Intersection Observer)
- **Error handling**: Fallback para ícone caso PDF não carregue
- **Performance**: Cache de thumbnails renderizados
- **Segurança**: Validar que é PDF válido antes de renderizar

### Estimativa
**Tempo**: 6-8 horas
- Setup pdf.js e configuração: 1h
- Componente PDFPreview (thumbnail): 2h
- Componente PDFViewer (modal completo): 2h
- Integração na página de detalhes: 1h
- Testes e ajustes: 1-2h

### Trade-offs
- ✅ **Pros**: Melhor UX, reduz downloads desnecessários, preview rápido
- ⚠️ **Cons**: Aumenta bundle size (~500KB), requer JavaScript no client

---

## 🔍 PR #2: Busca Full-Text com Postgres ou ElasticSearch

### Descrição
Implementar busca full-text avançada para melhorar resultados de pesquisa em títulos, descrições e conteúdo de PDFs.

### Opções de Implementação

#### Opção A: PostgreSQL Full-Text Search (Recomendada)

**Vantagens:**
- ✅ Sem infraestrutura adicional (usa banco existente)
- ✅ Custo zero de manutenção
- ✅ Integração nativa com Prisma
- ✅ Suporte a ranking e relevância
- ✅ Boa performance para até ~100k documentos
- ✅ Suporte a múltiplos idiomas (português)

**Desvantagens:**
- ⚠️ Não indexa conteúdo de PDFs diretamente (apenas metadados)
- ⚠️ Performance degrada com milhões de documentos
- ⚠️ Menos flexível que ElasticSearch

**Implementação:**
1. Adicionar coluna `searchVector` (tsvector) no schema
2. Criar índice GIN para busca rápida
3. Atualizar query em `app/materiais/page.tsx`
4. Adicionar trigger para atualizar searchVector automaticamente

#### Opção B: ElasticSearch

**Vantagens:**
- ✅ Busca extremamente rápida mesmo com milhões de documentos
- ✅ Pode indexar conteúdo completo de PDFs (com extração)
- ✅ Recursos avançados: autocomplete, sugestões, faceting
- ✅ Escalabilidade horizontal
- ✅ Analytics e agregações poderosas

**Desvantagens:**
- ⚠️ Requer infraestrutura adicional (servidor ES)
- ⚠️ Custo de manutenção e operação
- ⚠️ Complexidade de setup e sincronização
- ⚠️ Overhead para projetos pequenos/médios

### Recomendação: PostgreSQL Full-Text Search

Para este projeto, **PostgreSQL Full-Text Search** é a melhor opção porque:
1. Projeto já usa PostgreSQL
2. Não requer infraestrutura adicional
3. Performance suficiente para escala inicial/média
4. Implementação mais simples
5. Custo-benefício superior

**ElasticSearch** deve ser considerado apenas se:
- Volume de documentos > 100k
- Necessidade de indexar conteúdo de PDFs
- Requisitos de busca muito complexos

### Arquivos a Modificar/Criar

#### Novos Arquivos
- `prisma/migrations/XXXX_add_fulltext_search/migration.sql` - Migration para full-text
- `lib/search.ts` - Funções utilitárias de busca

#### Arquivos Modificados
- `prisma/schema.prisma` - Adicionar campo searchVector (opcional, pode ser apenas no SQL)
- `app/materiais/page.tsx` - Atualizar query de busca
- `app/actions/materials.ts` - Adicionar server action para busca (se necessário)

### Estrutura da Migration

```sql
-- Adicionar coluna para full-text search
ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
) STORED;

-- Criar índice GIN para performance
CREATE INDEX IF NOT EXISTS materials_search_vector_idx 
ON materials USING GIN(search_vector);

-- Função para busca
CREATE OR REPLACE FUNCTION search_materials(query_text text)
RETURNS TABLE(...) AS $$
  SELECT * FROM materials
  WHERE search_vector @@ plainto_tsquery('portuguese', query_text)
  ORDER BY ts_rank(search_vector, plainto_tsquery('portuguese', query_text)) DESC;
$$ LANGUAGE sql;
```

### Estimativa

#### Opção A (PostgreSQL): 4-6 horas
- Migration e índices: 1h
- Atualizar queries: 1-2h
- Testes e ajustes: 1-2h
- Documentação: 1h

#### Opção B (ElasticSearch): 12-16 horas
- Setup infraestrutura: 2-3h
- Configuração ES: 2-3h
- Sincronização com DB: 3-4h
- Integração na aplicação: 2-3h
- Testes e ajustes: 2-3h
- Documentação: 1h

### Trade-offs Resumidos

| Aspecto | PostgreSQL FTS | ElasticSearch |
|---------|---------------|---------------|
| **Setup** | ✅ Simples | ⚠️ Complexo |
| **Custo** | ✅ Zero | ⚠️ Infraestrutura |
| **Performance** | ✅ Boa (até 100k docs) | ✅ Excelente (milhões) |
| **Manutenção** | ✅ Baixa | ⚠️ Média-Alta |
| **Features** | ✅ Básicas | ✅ Avançadas |
| **Escalabilidade** | ⚠️ Limitada | ✅ Horizontal |

---

## 📊 PR #3: Relatórios CSV/Export e Gráficos no Admin

### Descrição
Adicionar funcionalidades de exportação de dados (CSV) e visualização de gráficos (Recharts) no painel administrativo.

### Funcionalidades

#### 1. Exportação CSV
- Exportar lista de materiais (com filtros)
- Exportar lista de usuários
- Exportar estatísticas de downloads
- Exportar relatório de atividades

#### 2. Gráficos e Visualizações
- Gráfico de materiais por status (pie/donut)
- Gráfico de downloads ao longo do tempo (line)
- Gráfico de materiais por curso/disciplina (bar)
- Gráfico de usuários por role (pie)
- Tendências de uploads (area chart)

### Arquivos a Modificar/Criar

#### Novos Arquivos
- `components/admin/ExportButton.tsx` - Botão de exportação CSV
- `components/admin/ChartsSection.tsx` - Seção de gráficos
- `components/admin/DownloadsChart.tsx` - Gráfico de downloads
- `components/admin/MaterialsChart.tsx` - Gráfico de materiais
- `components/admin/UsersChart.tsx` - Gráfico de usuários
- `app/actions/admin/export.ts` - Server actions para exportação
- `app/api/admin/export/route.ts` - API route para download CSV

#### Arquivos Modificados
- `app/admin/page.tsx` - Adicionar seções de gráficos e botões de export
- `package.json` - Adicionar `recharts` e `papaparse`

### Estrutura Sugerida

```typescript
// components/admin/ChartsSection.tsx
// Grid responsivo com múltiplos gráficos
// Usa Recharts para visualizações

// app/actions/admin/export.ts
// Server actions para gerar CSV
// Funções: exportMaterials, exportUsers, exportDownloads
```

### Dependências
```json
{
  "recharts": "^2.12.0",
  "papaparse": "^5.4.1"
}
```

### Considerações Técnicas
- **Server Actions para CSV**: Gerar CSV no servidor (segurança)
- **Lazy loading de gráficos**: Carregar dados apenas quando necessário
- **Responsividade**: Gráficos adaptáveis a mobile
- **Acessibilidade**: Labels e aria-labels nos gráficos
- **Performance**: Cache de dados agregados quando possível

### Estimativa
**Tempo**: 8-10 horas
- Setup Recharts e estrutura: 1h
- Componentes de gráficos (3-4 gráficos): 3-4h
- Exportação CSV (server actions + API routes): 2h
- Integração no admin: 1h
- Testes e ajustes: 1-2h
- Polimento UI/UX: 1h

### Funcionalidades Detalhadas

#### Exportação CSV
1. **Exportar Materiais**
   - Campos: título, descrição, curso, disciplina, semestre, tipo, downloads, status, data
   - Suporta filtros aplicados na página

2. **Exportar Usuários**
   - Campos: nome, email, role, materiais enviados, downloads, data de cadastro

3. **Exportar Downloads**
   - Campos: material, usuário, IP, data
   - Agrupado por período (opcional)

#### Gráficos
1. **Dashboard Overview**
   - Cards com métricas principais (já existe)
   - Gráfico de distribuição de status
   - Gráfico de tendência de uploads (últimos 30 dias)

2. **Análise de Materiais**
   - Materiais por curso (bar chart)
   - Materiais por disciplina (bar chart)
   - Top 10 materiais mais baixados (bar chart horizontal)

3. **Análise de Usuários**
   - Distribuição de roles (pie chart)
   - Usuários ativos (line chart - últimos 30 dias)

4. **Análise de Downloads**
   - Downloads ao longo do tempo (area chart)
   - Downloads por dia da semana (bar chart)

---

## 📋 Resumo das Estimativas

| PR | Feature | Estimativa | Complexidade |
|----|---------|------------|--------------|
| #1 | Preview PDF (pdf.js) | 6-8h | Média |
| #2 | Full-Text Search (Postgres) | 4-6h | Média |
| #2 | Full-Text Search (ElasticSearch) | 12-16h | Alta |
| #3 | Export CSV + Gráficos | 8-10h | Média |

**Total (com Postgres)**: 18-24 horas
**Total (com ElasticSearch)**: 26-34 horas

---

## 🎯 Ordem Recomendada de Implementação

1. **PR #2 (Full-Text Search)** - Melhora experiência de busca imediatamente
2. **PR #1 (Preview PDF)** - Melhora UX na visualização
3. **PR #3 (Export + Gráficos)** - Adiciona valor analítico ao admin

---

## 📝 Notas Adicionais

### Segurança
- Todas as exportações devem validar permissões de admin
- CSV deve sanitizar dados para prevenir injection
- Preview de PDF deve validar que o arquivo é PDF válido

### Performance
- Implementar paginação nos exports grandes
- Cache de dados agregados para gráficos
- Lazy loading de componentes pesados

### Acessibilidade
- Gráficos devem ter alternativas textuais
- Exportações devem ter feedback claro
- Preview deve ter fallback para leitores de tela

### Testes
- Testes unitários para funções de export
- Testes E2E para fluxo de preview
- Testes de performance para busca full-text

