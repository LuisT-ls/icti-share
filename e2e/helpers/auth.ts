/**
 * Helpers para testes E2E de autenticação
 */

interface TestUser {
  email: string;
  password: string;
  name: string;
}

/**
 * Cria um usuário de teste via API ou ação
 * Nota: Em produção, você pode usar uma API de teste ou seed do banco
 */
export async function createTestUser(): Promise<TestUser> {
  const timestamp = Date.now();
  return {
    email: `teste${timestamp}@example.com`,
    password: "senha123456",
    name: `Usuário Teste ${timestamp}`,
  };
}

/**
 * Faz login do usuário na página
 */
export async function loginUser(
  page: any,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\//, { timeout: 10000 });
}

/**
 * Limpa usuário de teste
 * Nota: Implementar conforme sua estratégia de limpeza
 */
export async function deleteTestUser(email: string): Promise<void> {
  // Implementar limpeza se necessário
  // Por exemplo, chamar uma API de teste ou deletar do banco
  console.log(`Limpar usuário de teste: ${email}`);
}

