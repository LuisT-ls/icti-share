import { z } from "zod";

/**
 * Schemas de validação Zod reutilizáveis
 * Usados tanto no cliente (React Hook Form) quanto no servidor (Server Actions)
 */

// Schema de Signup
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
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
