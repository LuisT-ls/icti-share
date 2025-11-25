import { z } from "zod";

/**
 * Schemas de validação Zod reutilizáveis
 * Usados tanto no cliente (React Hook Form) quanto no servidor (Server Actions)
 */

// Opções de curso disponíveis
export const COURSE_OPTIONS = [
  "Engenharia Elétrica",
  "Engenharia de Produção",
  "Bacharel Interdisciplinar em Ciência, Tecnologia e Inovação",
] as const;

export type CourseOption = (typeof COURSE_OPTIONS)[number];

// Schema de Signup
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(100, "Nome muito longo")
      .trim(),
    email: z.string().email("Email inválido").toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .max(100, "Senha muito longa")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .regex(
        /[^A-Za-z0-9]/,
        "Senha deve conter pelo menos um símbolo (!@#$%^&*()_+-=[]{}|;:,.<>?)"
      ),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    course: z
      .string({
        required_error: "Selecione um curso",
      })
      .min(1, "Selecione um curso")
      .refine(
        (val) =>
          val !== "" &&
          [
            "Engenharia Elétrica",
            "Engenharia de Produção",
            "Bacharel Interdisciplinar em Ciência, Tecnologia e Inovação",
          ].includes(val),
        {
          message: "Selecione um curso válido",
        }
      ),
  })
  .superRefine((data, ctx) => {
    // Validar correspondência de senhas apenas se ambos estiverem preenchidos
    // e tiverem pelo menos 1 caractere (já que min(1) valida isso)
    if (
      data.password &&
      data.password.length > 0 &&
      data.confirmPassword &&
      data.confirmPassword.length > 0
    ) {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "As senhas não coincidem",
          path: ["confirmPassword"],
        });
      }
    }
  })
  .refine((data) => data.course && data.course !== "", {
    message: "Selecione um curso",
    path: ["course"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// Schema de Login
export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema de Upload de Material
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const uploadMaterialSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo (máximo 200 caracteres)")
    .trim(),
  description: z
    .string()
    .max(1000, "Descrição muito longa (máximo 1000 caracteres)")
    .optional()
    .or(z.literal("")),
  course: z
    .string()
    .max(100, "Curso muito longo (máximo 100 caracteres)")
    .optional()
    .or(z.literal("")),
  discipline: z
    .string()
    .max(100, "Disciplina muito longa (máximo 100 caracteres)")
    .optional()
    .or(z.literal("")),
  semester: z
    .string()
    .max(50, "Semestre muito longo (máximo 50 caracteres)")
    .optional()
    .or(z.literal("")),
  type: z
    .string()
    .max(50, "Tipo muito longo (máximo 50 caracteres)")
    .optional()
    .or(z.literal("")),
  file: z
    .any()
    .refine(
      (file) => {
        // Aceitar File ou FileList
        if (file instanceof File) {
          return file.size > 0;
        }
        if (file instanceof FileList) {
          return file.length > 0 && file[0] instanceof File && file[0].size > 0;
        }
        return false;
      },
      {
        message: "Arquivo é obrigatório",
      }
    )
    .refine(
      (file) => {
        const actualFile =
          file instanceof File
            ? file
            : file instanceof FileList && file.length > 0
              ? file[0]
              : null;
        return actualFile instanceof File && actualFile.size <= MAX_FILE_SIZE;
      },
      {
        message: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      }
    )
    .refine(
      (file) => {
        const actualFile =
          file instanceof File
            ? file
            : file instanceof FileList && file.length > 0
              ? file[0]
              : null;
        return (
          actualFile instanceof File && actualFile.type === "application/pdf"
        );
      },
      {
        message: "Apenas arquivos PDF são permitidos",
      }
    ),
});

export type UploadMaterialFormData = z.infer<typeof uploadMaterialSchema>;

// Schema para validação no servidor (sem o arquivo, que é validado separadamente)
export const uploadMaterialServerSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo")
    .trim(),
  description: z
    .string()
    .max(1000, "Descrição muito longa")
    .optional()
    .nullable(),
  course: z.string().max(100, "Curso muito longo").optional().nullable(),
  discipline: z
    .string()
    .max(100, "Disciplina muito longa")
    .optional()
    .nullable(),
  semester: z.string().max(50, "Semestre muito longo").optional().nullable(),
  type: z.string().max(50, "Tipo muito longo").optional().nullable(),
});

// Schema de Edição de Material
export const editMaterialSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo (máximo 200 caracteres)")
    .trim(),
  description: z
    .string()
    .max(1000, "Descrição muito longa (máximo 1000 caracteres)")
    .optional()
    .or(z.literal("")),
  course: z
    .string()
    .max(100, "Curso muito longo (máximo 100 caracteres)")
    .optional()
    .or(z.literal("")),
  discipline: z
    .string()
    .max(100, "Disciplina muito longa (máximo 100 caracteres)")
    .optional()
    .or(z.literal("")),
  semester: z
    .string()
    .max(50, "Semestre muito longo (máximo 50 caracteres)")
    .optional()
    .or(z.literal("")),
  type: z
    .string()
    .max(50, "Tipo muito longo (máximo 50 caracteres)")
    .optional()
    .or(z.literal("")),
});

export type EditMaterialFormData = z.infer<typeof editMaterialSchema>;

// Schema de Edição de Perfil
export const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo (máximo 100 caracteres)")
    .trim(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// Schema de Alteração de Senha
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .max(100, "Senha muito longa")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .regex(
        /[^A-Za-z0-9]/,
        "Senha deve conter pelo menos um símbolo (!@#$%^&*()_+-=[]{}|;:,.<>?)"
      ),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da senha atual",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
