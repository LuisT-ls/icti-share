# Debug de Problemas de Login

## Erro: CredentialsSignin (403)

Este erro ocorre quando o NextAuth rejeita as credenciais no método `authorize`.

### Possíveis Causas:

1. **Usuário não existe no banco de dados**
   - Verifique se o email está cadastrado
   - Verifique se há diferença entre maiúsculas/minúsculas no email

2. **Senha incorreta**
   - Verifique se a senha está correta
   - Verifique se o hash da senha está correto no banco

3. **Problema com conexão do banco**
   - Verifique se `DATABASE_URL` está configurado corretamente no Vercel
   - Verifique se o banco está acessível

4. **Problema com Prisma Client**
   - Verifique se o Prisma Client foi gerado (`npm run prisma:generate`)
   - Verifique se as migrations foram aplicadas

### Como Verificar:

1. **Verificar logs no Vercel:**
   - Acesse: Dashboard → Deployments → Seu deployment → Functions → View Logs
   - Procure por mensagens como:
     - "Tentativa de login para: [email]"
     - "Usuário não encontrado"
     - "Senha inválida"
     - "Erro no authorize"

2. **Verificar usuário no banco:**

   ```sql
   SELECT id, email, name, role, "passwordHash" IS NOT NULL as has_password
   FROM users
   WHERE email = 'seu-email@exemplo.com';
   ```

3. **Testar localmente:**
   ```bash
   npm run dev
   # Tente fazer login e verifique os logs no terminal
   ```

### Solução Temporária:

Se o problema persistir, você pode criar um novo usuário com uma senha conhecida:

```bash
# No terminal local ou via Railway CLI
npm run prisma:studio
# Ou use o seed:
npm run prisma:seed
```

Os usuários de seed têm a senha: `Senha123!`
