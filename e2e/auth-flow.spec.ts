import { test, expect } from "@playwright/test";

test.describe("Fluxo de Autenticação", () => {
  test("deve permitir signup → login → logout", async ({ page }) => {
    const timestamp = Date.now();
    const email = `teste${timestamp}@example.com`;
    const password = "Senha123!";
    const name = "Usuário Teste";

    // 1. Acessar página de signup
    await page.goto("/signup");
    await expect(page).toHaveTitle(/Criar conta|Signup/i);

    // 2. Preencher formulário de signup
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    // Selecionar curso (obrigatório)
    await page.selectOption("select#course", "Engenharia Elétrica");

    // 3. Submeter formulário
    await page.click('button[type="submit"]');

    // 4. Aguardar redirecionamento (pode ser para home ou login)
    await page.waitForURL(/\//, { timeout: 10000 });

    // 5. Fazer logout se estiver logado
    const logoutButton = page.locator("text=/Sair|Logout/i");
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/\//);
    }

    // 6. Fazer login
    await page.goto("/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // 7. Verificar que foi redirecionado
    await page.waitForURL(/\//, { timeout: 10000 });
  });

  test("deve exibir erro ao tentar login com credenciais inválidas", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "email-invalido@example.com");
    await page.fill('input[name="password"]', "senha-errada");
    await page.click('button[type="submit"]');

    // Aguardar mensagem de erro
    await expect(
      page.locator("text=/Email ou senha incorretos|Dados inválidos/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("deve validar formulário de signup", async ({ page }) => {
    await page.goto("/signup");

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Verificar mensagens de erro
    await expect(page.locator("text=/obrigatório|mínimo/i")).toBeVisible();
  });
});
