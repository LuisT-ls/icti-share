"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { editMaterialSchema } from "@/lib/validations/schemas";
import { sanitizeString } from "@/lib/security/sanitize";
import { createAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

export async function deleteMaterial(materialId: string) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { uploadedBy: true },
    });

    if (!material) {
      return { success: false, error: "Material não encontrado" };
    }

    // Verificar se o usuário é o dono ou admin
    if (
      material.uploadedById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return {
        success: false,
        error: "Sem permissão para excluir este material",
      };
    }

    // Deletar arquivo físico apenas se não estiver em base64 (Vercel)
    // Arquivos em base64 são armazenados no banco, não precisam ser deletados do disco
    if (!material.path.startsWith("base64:") && existsSync(material.path)) {
      try {
        await unlink(material.path);
      } catch (error) {
        console.error("Erro ao deletar arquivo físico:", error);
        // Continua mesmo se não conseguir deletar o arquivo
      }
    }

    // Deletar do banco (cascade deleta downloads)
    await prisma.material.delete({
      where: { id: materialId },
    });

    // Log de auditoria
    const headersList = await headers();
    await createAuditLog({
      action: AuditAction.MATERIAL_DELETE,
      userId: session.user.id,
      entityType: "Material",
      entityId: materialId,
      description: `Material deletado: ${material.title}`,
      metadata: {
        filename: material.filename,
        uploadedBy: material.uploadedBy.email,
      },
      ipAddress:
        headersList.get("x-forwarded-for")?.split(",")[0] ||
        headersList.get("x-real-ip") ||
        undefined,
      userAgent: headersList.get("user-agent") || undefined,
    });

    revalidatePath("/meus-materiais");
    revalidatePath("/materiais");
    revalidatePath("/admin");
    revalidatePath("/perfil");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar material:", error);
    return { success: false, error: "Erro ao deletar material" };
  }
}

export async function updateMaterial(materialId: string, formData: FormData) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return { success: false, error: "Material não encontrado" };
    }

    // Verificar se o usuário é o dono ou admin
    if (
      material.uploadedById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return {
        success: false,
        error: "Sem permissão para editar este material",
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

    const parsed = editMaterialSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Dados inválidos",
      };
    }

    await prisma.material.update({
      where: { id: materialId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        course: parsed.data.course || null,
        discipline: parsed.data.discipline || null,
        semester: parsed.data.semester || null,
        type: parsed.data.type || null,
      },
    });

    revalidatePath("/meus-materiais");
    revalidatePath(`/material/${materialId}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    return { success: false, error: "Erro ao atualizar material" };
  }
}
