# Templates de Pull Requests

Templates prontos para criar os PRs das melhorias sugeridas.

---

## 🔵 PR #1: Preview de PDF com pdf.js

### Título

`feat: adiciona preview de PDF com pdf.js na página de detalhes`

### Descrição

```markdown
## 🎯 Objetivo

Implementar visualização de thumbnails e preview completo de PDFs usando pdf.js na página de detalhes do material.

## ✨ Funcionalidades

- ✅ Thumbnail da primeira página do PDF
- ✅ Modal com visualizador completo
- ✅ Navegação entre páginas
- ✅ Controles de zoom
- ✅ Lazy loading para performance

## 📦 Mudanças

- Adiciona componente `PDFPreview` para thumbnails
- Adiciona componente `PDFViewer` para visualização completa
- Integra preview na página `/material/[id]`
- Adiciona dependência `pdfjs-dist`

## 🧪 Testes

- [ ] Preview carrega corretamente
- [ ] Fallback para PDFs inválidos
- [ ] Performance com PDFs grandes
- [ ] Acessibilidade (ARIA labels)

## 📸 Screenshots

_(adicionar screenshots após implementação)_

## 🔗 Issues Relacionadas

Closes #XXX
```

---

## 🔵 PR #2: Busca Full-Text com PostgreSQL

### Título

`feat: implementa busca full-text com PostgreSQL`

### Descrição

```markdown
## 🎯 Objetivo

Melhorar qualidade e performance da busca de materiais usando PostgreSQL Full-Text Search.

## ✨ Funcionalidades

- ✅ Busca full-text em títulos e descrições
- ✅ Ranking por relevância
- ✅ Suporte a português (stemming)
- ✅ Performance otimizada com índices GIN

## 📦 Mudanças

- Adiciona migration para coluna `search_vector` (tsvector)
- Cria índice GIN para busca rápida
- Atualiza query de busca em `/materiais`
- Adiciona função SQL para busca com ranking

## 🧪 Testes

- [ ] Busca retorna resultados relevantes
- [ ] Ranking funciona corretamente
- [ ] Performance com muitos documentos
- [ ] Busca case-insensitive

## 📊 Performance

- Índice GIN criado para otimização
- Query otimizada com `ts_rank` para relevância

## 🔗 Issues Relacionadas

Closes #XXX
```

---

## 🔵 PR #3: Export CSV e Gráficos no Admin

### Título

`feat: adiciona exportação CSV e gráficos no painel admin`

### Descrição

```markdown
## 🎯 Objetivo

Adicionar funcionalidades de exportação de dados e visualização de gráficos no painel administrativo.

## ✨ Funcionalidades

### Exportação CSV

- ✅ Exportar lista de materiais
- ✅ Exportar lista de usuários
- ✅ Exportar estatísticas de downloads
- ✅ Suporte a filtros aplicados

### Gráficos (Recharts)

- ✅ Distribuição de materiais por status
- ✅ Tendência de uploads (últimos 30 dias)
- ✅ Materiais por curso/disciplina
- ✅ Downloads ao longo do tempo
- ✅ Distribuição de usuários por role

## 📦 Mudanças

- Adiciona componentes de gráficos (`ChartsSection`, etc.)
- Adiciona server actions para exportação CSV
- Adiciona API route para download de CSV
- Integra gráficos no painel admin
- Adiciona dependências `recharts` e `papaparse`

## 🧪 Testes

- [ ] Exportação CSV funciona corretamente
- [ ] Gráficos renderizam dados corretos
- [ ] Filtros aplicados no export
- [ ] Responsividade dos gráficos
- [ ] Acessibilidade (labels, ARIA)

## 📸 Screenshots

_(adicionar screenshots após implementação)_

## 🔗 Issues Relacionadas

Closes #XXX
```

---

## 📋 Checklist Geral para PRs

### Antes de Abrir o PR

- [ ] Código segue padrões do projeto
- [ ] TypeScript sem erros
- [ ] Linter passou (`npm run lint`)
- [ ] Testes passando (`npm test`)
- [ ] Documentação atualizada (se necessário)
- [ ] Migrations testadas (se aplicável)

### Revisão de Código

- [ ] Segurança: validações e sanitização
- [ ] Performance: otimizações aplicadas
- [ ] Acessibilidade: ARIA labels, navegação por teclado
- [ ] Responsividade: funciona em mobile
- [ ] Error handling: tratamento de erros adequado

---

## 🚀 Como Usar

1. Copie o template do PR desejado
2. Preencha as informações específicas
3. Adicione screenshots quando aplicável
4. Referencie issues relacionadas
5. Marque os checkboxes conforme implementação
