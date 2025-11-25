"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { uploadMaterialServerSchema } from "@/lib/validations/schemas";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB em bytes
const ALLOWED_MIME_TYPES = ["application/pdf"];

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

    // Validar dados do formulário
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string | null,
      course: formData.get("course") as string | null,
      discipline: formData.get("discipline") as string | null,
      semester: formData.get("semester") as string | null,
      type: formData.get("type") as string | null,
    };

    const parsed = uploadMaterialServerSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Dados inválidos",
      };
    }

    // Validar arquivo
    const file = formData.get("file") as File | null;
    if (!file) {
      return {
        success: false,
        error: "Arquivo é obrigatório",
      };
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      };
    }

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Apenas arquivos PDF são permitidos",
      };
    }

    // Validação adicional: verificar extensão do arquivo
    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop()?.toLowerCase();
    if (fileExtension !== "pdf") {
      return {
        success: false,
        error: "Apenas arquivos PDF são permitidos",
      };
    }

    // Verificar tipo MIME real do arquivo (primeiros bytes)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Verificar magic bytes do PDF: %PDF
    const pdfMagicBytes = buffer.slice(0, 4).toString("ascii");
    if (pdfMagicBytes !== "%PDF") {
      return {
        success: false,
        error: "Arquivo não é um PDF válido",
      };
    }

    // Obter diretório de upload
    const uploadDir =
      process.env.RAILWAY_VOLUME_PATH ||
      process.env.UPLOAD_DIR ||
      "./uploads";

    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único: UUID + nome original (sanitizado)
    const uuid = randomUUID();
    const sanitizedFilename = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100); // Limitar tamanho do nome
    const uniqueFilename = `${uuid}-${sanitizedFilename}`;
    const filePath = join(uploadDir, uniqueFilename);

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

