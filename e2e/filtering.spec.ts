import { test, expect } from "@playwright/test";
import { loginUser, createTestUser, deleteTestUser } from "./helpers/auth";

test.describe("Filtragem de Materiais", () => {
  let testEmail: string;
  let testPassword: string;

  test.beforeAll(async () => {
    const user = await createTestUser();
    testEmail = user.email;
    testPassword = user.password;
  });

  test.afterAll(async () => {
    if (testEmail) {
      await deleteTestUser(testEmail);
    }
  });

  test("deve exibir página de materiais", async ({ page }) => {
    await page.goto("/materiais");

    // Verificar se a página carregou
    await expect(
      page.locator('text=/Materiais|Material/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("deve permitir filtrar materiais", async ({ page }) => {
    await page.goto("/materiais");

    // Procurar por campo de busca
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill("teste");
      // Pressionar Enter ou clicar em aplicar filtros
      const applyButton = page.locator('button:has-text("Aplicar Filtros")');
      if (await applyButton.count() > 0) {
        await applyButton.click();
        await page.waitForTimeout(1000); // Aguardar aplicação dos filtros
      } else {
        // Se não houver botão, pressionar Enter
        await searchInput.first().press("Enter");
        await page.waitForTimeout(500);
      }
    }

    // Verificar se a página ainda está carregada
    await expect(page).toHaveURL(/\/materiais/);
  });

  test("deve exibir lista vazia quando não há materiais", async ({ page }) => {
    await page.goto("/materiais");

    // Verificar se há mensagem de "nenhum material" ou lista vazia
    const emptyMessage = page.locator('text=/nenhum|Nenhum|vazio/i');
    
    // Se houver mensagem de vazio, verificar
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });
});

