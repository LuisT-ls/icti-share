import { describe, it, expect } from "@jest/globals";
import {
  signupSchema,
  loginSchema,
  uploadMaterialSchema,
  editMaterialSchema,
  editProfileSchema,
} from "@/lib/validations/schemas";

describe("Zod Validation Schemas", () => {
  describe("signupSchema", () => {
    it("deve validar dados corretos", () => {
      const validData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "senha123",
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar nome muito curto", () => {
      const invalidData = {
        name: "J",
        email: "joao@example.com",
        password: "senha123",
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("mínimo 2 caracteres");
      }
    });

    it("deve rejeitar email inválido", () => {
      const invalidData = {
        name: "João Silva",
        email: "email-invalido",
        password: "senha123",
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("Email inválido");
      }
    });

    it("deve rejeitar senha muito curta", () => {
      const invalidData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "12345",
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("mínimo 6 caracteres");
      }
    });

    it("deve normalizar email para lowercase", () => {
      const data = {
        name: "João Silva",
        email: "JOAO@EXAMPLE.COM",
        password: "senha123",
      };

      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("joao@example.com");
      }
    });
  });

  describe("loginSchema", () => {
    it("deve validar dados corretos", () => {
      const validData = {
        email: "joao@example.com",
        password: "senha123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar email inválido", () => {
      const invalidData = {
        email: "email-invalido",
        password: "senha123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha vazia", () => {
      const invalidData = {
        email: "joao@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("obrigatória");
      }
    });
  });

  describe("uploadMaterialSchema", () => {
    it("deve validar dados corretos com arquivo", () => {
      const file = new File(["conteudo"], "test.pdf", {
        type: "application/pdf",
      });

      const validData = {
        title: "Apostila de Cálculo",
        description: "Descrição do material",
        file: file,
      };

      const result = uploadMaterialSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar título vazio", () => {
      const file = new File(["conteudo"], "test.pdf", {
        type: "application/pdf",
      });

      const invalidData = {
        title: "",
        file: file,
      };

      const result = uploadMaterialSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("obrigatório");
      }
    });

    it("deve rejeitar título muito longo", () => {
      const file = new File(["conteudo"], "test.pdf", {
        type: "application/pdf",
      });

      const invalidData = {
        title: "a".repeat(201),
        file: file,
      };

      const result = uploadMaterialSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("muito longo");
      }
    });

    it("deve rejeitar arquivo não-PDF", () => {
      const file = new File(["conteudo"], "test.txt", {
        type: "text/plain",
      });

      const invalidData = {
        title: "Título válido",
        file: file,
      };

      const result = uploadMaterialSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes("PDF"))).toBe(true);
      }
    });

    it("deve rejeitar arquivo muito grande", () => {
      // Criar um arquivo maior que 25 MB
      const largeContent = new Array(26 * 1024 * 1024).fill("a").join("");
      const file = new File([largeContent], "large.pdf", {
        type: "application/pdf",
      });

      const invalidData = {
        title: "Título válido",
        file: file,
      };

      const result = uploadMaterialSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes("grande"))).toBe(true);
      }
    });

    it("deve aceitar campos opcionais vazios", () => {
      const file = new File(["conteudo"], "test.pdf", {
        type: "application/pdf",
      });

      const validData = {
        title: "Título válido",
        description: "",
        course: "",
        discipline: "",
        semester: "",
        type: "",
        file: file,
      };

      const result = uploadMaterialSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("editMaterialSchema", () => {
    it("deve validar dados corretos", () => {
      const validData = {
        title: "Título atualizado",
        description: "Nova descrição",
      };

      const result = editMaterialSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar título vazio", () => {
      const invalidData = {
        title: "",
      };

      const result = editMaterialSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("editProfileSchema", () => {
    it("deve validar nome correto", () => {
      const validData = {
        name: "João Silva",
      };

      const result = editProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar nome muito curto", () => {
      const invalidData = {
        name: "J",
      };

      const result = editProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("mínimo 2 caracteres");
      }
    });

    it("deve rejeitar nome muito longo", () => {
      const invalidData = {
        name: "a".repeat(101),
      };

      const result = editProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

