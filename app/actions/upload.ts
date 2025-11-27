"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
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
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

type UploadResult =
  | { success: true; materialId: string }
  | { success: false; error: string };

export async function uploadMaterial(
  formData: FormData
): Promise<UploadResult> {
  try {
    // Verificar autenticação
    const session = await auth();
    console.log("🔐 Verificando autenticação...", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      console.error("❌ Usuário não autenticado");
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
    console.log("⏱️ Verificando rate limit...", {
      identifier,
      ip,
      userId: session.user.id,
    });

    const rateLimitResult = checkRateLimit(
      identifier,
      RATE_LIMIT_CONFIGS.UPLOAD
    );
    console.log("⏱️ Resultado do rate limit:", rateLimitResult);

    if (!rateLimitResult.success) {
      console.error("❌ Rate limit excedido");
      return {
        success: false,
        error:
          rateLimitResult.error ||
          "Muitos uploads. Tente novamente mais tarde.",
      };
    }

    // Validar arquivo primeiro (mais crítico)
    const file = formData.get("file") as File | null;
    console.log("📄 Validando arquivo...", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    if (!file) {
      console.error("❌ Arquivo não encontrado no FormData");
      return {
        success: false,
        error: "Arquivo é obrigatório",
      };
    }

    // Validação completa e segura do arquivo
    const fileValidation = await validateFile(file);
    console.log("✅ Validação do arquivo:", fileValidation);
    if (!fileValidation.valid) {
      console.error("❌ Arquivo inválido:", fileValidation.error);
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
      console.error("❌ Erro na validação dos dados:", parsed.error.errors);
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Dados inválidos",
      };
    }

    // Sanitizar nome do arquivo
    const originalFilename = sanitizeFilename(file.name);
    console.log("📝 Nome do arquivo sanitizado:", originalFilename);

    // Detectar ambiente e definir diretório de upload
    const isVercel = !!process.env.VERCEL;
    const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

    let uploadDir: string;

    if (isVercel) {
      // No Vercel, usar /tmp (único diretório gravável)
      uploadDir = "/tmp/uploads";
      console.log("🌐 Ambiente detectado: Vercel - usando /tmp/uploads");
    } else if (isRailway && process.env.RAILWAY_VOLUME_PATH) {
      // No Railway com volume configurado
      uploadDir = process.env.RAILWAY_VOLUME_PATH;
      console.log("🚂 Ambiente detectado: Railway - usando volume persistente");
    } else if (process.env.UPLOAD_DIR) {
      // Diretório customizado via variável de ambiente
      uploadDir = process.env.UPLOAD_DIR;
      console.log("📁 Usando diretório customizado via UPLOAD_DIR");
    } else {
      // Fallback para desenvolvimento local - resolver para caminho absoluto
      uploadDir = resolve(process.cwd(), "uploads");
      console.log("💻 Ambiente: Desenvolvimento local - usando ./uploads");
    }

    // Garantir que o caminho seja absoluto
    if (!uploadDir.startsWith("/") && !uploadDir.startsWith("\\")) {
      uploadDir = resolve(process.cwd(), uploadDir);
    }

    console.log("📁 Diretório de upload final (absoluto):", uploadDir);

    // Criar diretório se não existir
    try {
      if (!existsSync(uploadDir)) {
        console.log("📁 Criando diretório de upload...");
        await mkdir(uploadDir, { recursive: true });
        console.log("✅ Diretório criado com sucesso");
      } else {
        console.log("✅ Diretório já existe");
      }
    } catch (error) {
      console.error("❌ Erro ao criar diretório:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Erro ao criar diretório de upload: ${errorMessage}. Verifique as permissões ou configure UPLOAD_DIR.`,
      };
    }

    // Gerar nome único: UUID + nome original (já sanitizado)
    const uuid = randomUUID();
    const uniqueFilename = `${uuid}-${originalFilename.substring(0, 100)}`;
    const filePath = join(uploadDir, uniqueFilename);
    console.log("💾 Caminho completo do arquivo:", filePath);

    // Ler buffer do arquivo (já validado)
    console.log("📦 Lendo buffer do arquivo...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("📦 Buffer lido, tamanho:", buffer.length);

    // No Vercel, armazenar conteúdo em base64 no banco (solução temporária)
    // No Railway/local, salvar no sistema de arquivos
    let finalPath = filePath;
    if (isVercel) {
      console.log(
        "🌐 Vercel detectado: armazenando arquivo em base64 no banco"
      );
      const base64Content = buffer.toString("base64");
      finalPath = `base64:${base64Content}`;
      console.log("✅ Arquivo convertido para base64 e será salvo no banco");
    } else {
      // Salvar arquivo no disco (Railway/local)
      console.log("💾 Salvando arquivo no disco...");
      await writeFile(filePath, buffer);
      console.log("✅ Arquivo salvo com sucesso no disco");
    }

    // Salvar metadados no banco
    console.log("💾 Salvando metadados no banco de dados...");
    const material = await prisma.material.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        filename: originalFilename,
        path: finalPath, // Usar finalPath (pode ser base64 no Vercel ou caminho no Railway)
        mimeType: file.type,
        size: file.size,
        uploadedById: session.user.id,
        course: parsed.data.course || null,
        discipline: parsed.data.discipline || null,
        semester: parsed.data.semester || null,
        type: parsed.data.type || null,
      },
    });

    console.log("✅ Upload concluído com sucesso! Material ID:", material.id);

    // Log de auditoria (reutilizar headersList já obtido anteriormente)
    await createAuditLog({
      action: AuditAction.MATERIAL_UPLOAD,
      userId: session.user.id,
      entityType: "Material",
      entityId: material.id,
      description: `Upload de material: ${parsed.data.title}`,
      metadata: {
        filename: originalFilename,
        size: file.size,
        mimeType: file.type,
        course: parsed.data.course,
        discipline: parsed.data.discipline,
      },
      ipAddress:
        headersList.get("x-forwarded-for")?.split(",")[0] ||
        headersList.get("x-real-ip") ||
        undefined,
      userAgent: headersList.get("user-agent") || undefined,
    });

    return {
      success: true,
      materialId: material.id,
    };
  } catch (error) {
    console.error("❌ Erro ao fazer upload:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "N/A"
    );
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error:
        error instanceof Error
          ? `Erro ao fazer upload: ${error.message}`
          : "Erro ao fazer upload. Tente novamente.",
    };
  }
}
