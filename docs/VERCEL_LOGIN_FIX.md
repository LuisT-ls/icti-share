# Solução para Erro de Login no Vercel

## Erro: CredentialsSignin (403)

Este erro ocorre quando o NextAuth não consegue autenticar o usuário. As causas mais comuns são:

### 1. Usuário não existe no banco de dados

**Solução:**

- Verifique se o email está cadastrado no banco
- Crie um novo usuário via cadastro ou seed

### 2. Senha incorreta

**Solução:**

- Verifique se está usando a senha correta
- Se necessário, redefina a senha ou crie um novo usuário

### 3. Problema com conexão do banco

**Verificar:**

1. Acesse o Vercel Dashboard
2. Vá em **Settings** → **Environment Variables**
3. Verifique se `DATABASE_URL` está configurada corretamente
4. A URL deve apontar para o banco PostgreSQL do Railway (não localhost)

**Exemplo correto:**

```
postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
```

**Exemplo incorreto:**

```
postgresql://postgres:senha@localhost:5432/railway
```

### 4. Migrations não aplicadas

**Solução:**
Execute as migrations no Vercel:

```bash
# Via Vercel CLI
vercel login
vercel link
vercel exec -- npm run prisma:migrate:deploy
```

Ou faça um novo deploy - o script de build agora executa migrations automaticamente.

### 5. Prisma Client não gerado

**Solução:**
O script `postinstall` já gera o Prisma Client automaticamente, mas você pode verificar:

```bash
vercel exec -- npm run prisma:generate
```

## Como Verificar os Logs

### No Vercel Dashboard:

1. Acesse: **Deployments** → Seu deployment → **Functions**
2. Clique em **View Logs**
3. Procure por mensagens como:
   - `[AUTH] Tentativa de login para: [email]`
   - `[AUTH] Usuário não encontrado`
   - `[AUTH] Senha inválida`
   - `[AUTH] ✅ Login bem-sucedido`
   - `❌ Erro ao conectar ao banco`

### Testar Localmente:

```bash
npm run dev
# Tente fazer login e verifique os logs no terminal
```

## Checklist de Verificação

- [ ] `DATABASE_URL` configurada no Vercel (apontando para Railway)
- [ ] `AUTH_SECRET` configurado no Vercel
- [ ] `AUTH_URL` configurado como `https://icti-share.vercel.app`
- [ ] Migrations aplicadas no banco
- [ ] Prisma Client gerado
- [ ] Usuário existe no banco de dados
- [ ] Senha está correta

## Criar Usuário de Teste

Se você não tem um usuário cadastrado, você pode:

1. **Criar via cadastro:**
   - Acesse `/signup`
   - Preencha o formulário
   - Use uma senha forte: `Senha123!`

2. **Criar via seed (local):**

   ```bash
   npm run prisma:seed
   ```

   Usuários criados:
   - `admin@icti.edu.br` / `Senha123!`
   - `joao.silva@icti.edu.br` / `Senha123!`
   - `maria.santos@icti.edu.br` / `Senha123!`

3. **Criar via SQL direto:**
   ```sql
   INSERT INTO users (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'seu-email@exemplo.com',
     'Seu Nome',
     '$2a$10$hash_da_senha_aqui',
     'USUARIO',
     NOW(),
     NOW()
   );
   ```

## Próximos Passos

1. Verifique os logs no Vercel para identificar o problema exato
2. Confirme que o usuário existe no banco
3. Verifique se a senha está correta
4. Se necessário, crie um novo usuário
