# 🌱 Seed do Banco de Dados

Este documento descreve como popular o banco de dados com dados de exemplo.

## 📋 O que é populado

### Usuários (3)

- ✅ **1 Admin**: `admin@icti.edu.br`
- ✅ **2 Usuários**: `joao.silva@icti.edu.br` e `maria.santos@icti.edu.br`
- ✅ Senha padrão para todos: `senha123`

### Materiais (10)

Materiais de exemplo com metadados variados:

- ✅ Cursos: Engenharia de Produção, Ciência da Computação
- ✅ Disciplinas: Cálculo I, Álgebra Linear, Estruturas de Dados, etc.
- ✅ Semestres: 2024.1, 2023.2
- ✅ Tipos: Apostila, Prova, Resumo, Slides, Lista de Exercícios, Material de Aula
- ✅ Downloads: 28 a 89 downloads por material

### Downloads Históricos

- ✅ Downloads distribuídos ao longo do tempo
- ✅ Alguns com usuários autenticados, outros anônimos
- ✅ IPs variados para simular diferentes origens

## 🚀 Como Executar

### Método 1: Comando Prisma (Recomendado)

```bash
pnpm prisma db seed
```

### Método 2: Script direto

```bash
pnpm prisma:seed
```

### Método 3: Executar diretamente

```bash
npx tsx prisma/seed.ts
```

## 📝 Pré-requisitos

1. **Banco de dados configurado**
   - Certifique-se de que `DATABASE_URL` está configurado no `.env`
   - Execute as migrações: `pnpm prisma migrate dev`

2. **Dependências instaladas**
   ```bash
   pnpm install
   ```

## 🔄 Comportamento

### Upsert de Usuários

- Se os usuários já existirem (mesmo email), eles **não serão duplicados**
- Os dados existentes serão mantidos

### Criação de Materiais

- Materiais são criados com arquivos PDF mock
- Arquivos são salvos no diretório de uploads configurado
- Se o diretório não existir, será criado automaticamente

### Downloads

- Downloads são criados com datas aleatórias
- Distribuídos entre usuários autenticados e anônimos
- IPs variados para simular diferentes origens

## 🗑️ Limpar Dados (Opcional)

Se quiser resetar o banco antes de popular:

```bash
# Resetar banco (CUIDADO: apaga todos os dados!)
pnpm prisma migrate reset

# Depois executar seed
pnpm prisma db seed
```

Ou descomente as linhas no início do `prisma/seed.ts`:

```typescript
// Limpar dados existentes
await prisma.download.deleteMany();
await prisma.material.deleteMany();
await prisma.user.deleteMany();
```

## 📊 Dados Criados

### Usuários

| Email                    | Nome          | Role    | Senha    |
| ------------------------ | ------------- | ------- | -------- |
| admin@icti.edu.br        | Administrador | ADMIN   | senha123 |
| joao.silva@icti.edu.br   | João Silva    | USUARIO | senha123 |
| maria.santos@icti.edu.br | Maria Santos  | USUARIO | senha123 |

### Materiais

10 materiais com:

- Títulos descritivos
- Descrições detalhadas
- Metadados variados (curso, disciplina, semestre, tipo)
- Downloads históricos (28-89 downloads cada)

### Downloads

- Total: ~500+ downloads
- Distribuídos entre os materiais
- Alguns com usuários, outros anônimos
- IPs variados

## 🔍 Verificar Dados

### Via Prisma Studio

```bash
pnpm prisma studio
```

### Via SQL

```bash
# Conectar ao banco
psql $DATABASE_URL

# Contar registros
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM materials;
SELECT COUNT(*) FROM downloads;
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'tsx'"

```bash
pnpm install tsx --save-dev
```

### Erro: "DATABASE_URL is not set"

Certifique-se de que o arquivo `.env` existe e contém:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### Erro: "Table does not exist"

Execute as migrações primeiro:

```bash
pnpm prisma migrate dev
```

### Arquivos não são criados

Verifique permissões do diretório de uploads:

```bash
# Criar diretório manualmente se necessário
mkdir -p uploads
chmod 755 uploads
```

## 📚 Referências

- [Prisma Seed Documentation](https://www.prisma.io/docs/guides/database/seed-database)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

---

**Última atualização:** 2024
