# icti-share

Sistema de compartilhamento de materiais PDF com controle de usuários, downloads e permissões.

## 🚀 Configuração Inicial

### Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis obrigatórias no arquivo `.env`:
   - `DATABASE_URL` - URL de conexão PostgreSQL
   - `NEXTAUTH_URL` - URL base da aplicação
   - `NEXTAUTH_SECRET` - Secret para NextAuth (gere com: `openssl rand -base64 32`)

3. Para instruções detalhadas, consulte [ENV_SETUP.md](./ENV_SETUP.md)

### Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Abrir Prisma Studio (opcional)
npm run prisma:studio
```

## 📚 Documentação

- [Configuração de Variáveis de Ambiente](./ENV_SETUP.md) - Guia completo de configuração