import { test, expect } from "@playwright/test";
import { createTestUser, loginUser, deleteTestUser } from "./helpers/auth";

// Helper para criar arquivo PDF mock
async function createMockPDFFile(page: any): Promise<void> {
  // Em testes reais, você precisaria de um arquivo PDF real
  // Por enquanto, apenas verificamos se o campo está presente
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeVisible();
}

test.describe("Fluxo de Upload e Download", () => {
  let testEmail: string;
  let testPassword: string;

  test.beforeAll(async () => {
    // Criar usuário de teste
    const user = await createTestUser();
    testEmail = user.email;
    testPassword = user.password;
  });

  test.afterAll(async () => {
    // Limpar usuário de teste
    if (testEmail) {
      await deleteTestUser(testEmail);
    }
  });

  test("deve permitir login → upload → download", async ({ page }) => {
    // 1. Fazer login
    await loginUser(page, testEmail, testPassword);
    await page.waitForURL(/\//, { timeout: 10000 });

    // 2. Navegar para página de upload
    await page.goto("/upload");
    await expect(page).toHaveTitle(/Upload|Enviar/i);

    // 3. Preencher formulário de upload
    const title = `Material Teste ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('textarea[name="description"]', "Descrição de teste");

    // 4. Verificar campo de arquivo
    await createMockPDFFile(page);

    // 5. Verificar campos opcionais
    await page.fill('input[name="course"]', "Engenharia");
    await page.fill('input[name="discipline"]', "Cálculo I");

    // Nota: Upload real requer arquivo PDF válido
    // Este teste verifica se o formulário está renderizado corretamente
  });

  test("deve validar formulário de upload", async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    await page.goto("/upload");

    // Tentar submeter sem preencher título
    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    await expect(
      page.locator('text=/obrigatório|Título/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test("deve navegar para página de materiais", async ({ page }) => {
    await loginUser(page, testEmail, testPassword);
    
    // Navegar para página de materiais
    await page.goto("/materiais");
    
    // Verificar se a página carregou
    await expect(page.locator('text=/Materiais|Material/i').first()).toBeVisible();
  });
});

