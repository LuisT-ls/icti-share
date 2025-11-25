"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { uploadMaterialServerSchema } from "@/lib/validations/schemas";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";
import { sanitizeString, sanitizeFilename } from "@/lib/security/sanitize";
import { validateFile } from "@/lib/security/file-validation";

type UploadResult =
  | { success: true; materialId: string }
  | { success: false; error: string };

export async function uploadMaterial(
  formData: FormData
): Promise<UploadResult> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Você precisa estar autenticado para fazer upload",
      };
    }

    // Rate limiting
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      null;

    const identifier = getRateLimitIdentifier(ip, session.user.id);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.UPLOAD);

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: rateLimitResult.error || "Muitos uploads. Tente novamente mais tarde.",
      };
    }

    // Validar arquivo primeiro (mais crítico)
    const file = formData.get("file") as File | null;
    if (!file) {
      return {
        success: false,
        error: "Arquivo é obrigatório",
      };
    }

    // Validação completa e segura do arquivo
    const fileValidation = await validateFile(file);
    if (!fileValidation.valid) {
      return {
        success: false,
        error: fileValidation.error || "Arquivo inválido",
      };
    }

    // Sanitizar e validar dados do formulário
    const rawData = {
      title: sanitizeString(formData.get("title") as string),
      description: formData.get("description")
        ? sanitizeString(formData.get("description") as string)
        : null,
      course: formData.get("course")
        ? sanitizeString(formData.get("course") as string)
        : null,
      discipline: formData.get("discipline")
        ? sanitizeString(formData.get("discipline") as string)
        : null,
      semester: formData.get("semester")
        ? sanitizeString(formData.get("semester") as string)
        : null,
      type: formData.get("type")
        ? sanitizeString(formData.get("type") as string)
        : null,
    };

    const parsed = uploadMaterialServerSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Dados inválidos",
      };
    }

    // Sanitizar nome do arquivo
    const originalFilename = sanitizeFilename(file.name);

    // Obter diretório de upload
    const uploadDir =
      process.env.RAILWAY_VOLUME_PATH ||
      process.env.UPLOAD_DIR ||
      "./uploads";

    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único: UUID + nome original (já sanitizado)
    const uuid = randomUUID();
    const uniqueFilename = `${uuid}-${originalFilename.substring(0, 100)}`;
    const filePath = join(uploadDir, uniqueFilename);

    // Ler buffer do arquivo (já validado)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Salvar metadados no banco
    const material = await prisma.material.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        filename: originalFilename,
        path: filePath,
        mimeType: file.type,
        size: file.size,
        uploadedById: session.user.id,
        course: parsed.data.course || null,
        discipline: parsed.data.discipline || null,
        semester: parsed.data.semester || null,
        type: parsed.data.type || null,
      },
    });

    return {
      success: true,
      materialId: material.id,
    };
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return {
      success: false,
      error: "Erro ao fazer upload. Tente novamente.",
    };
  }
}

