"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { editMaterialSchema } from "@/lib/validations/schemas";

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
      return { success: false, error: "Sem permissão para excluir este material" };
    }

    // Deletar arquivo físico
    if (existsSync(material.path)) {
      await unlink(material.path);
    }

    // Deletar do banco (cascade deleta downloads)
    await prisma.material.delete({
      where: { id: materialId },
    });

    revalidatePath("/meus-materiais");
    revalidatePath("/materiais");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar material:", error);
    return { success: false, error: "Erro ao deletar material" };
  }
}

export async function updateMaterial(
  materialId: string,
  formData: FormData
) {
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
      return { success: false, error: "Sem permissão para editar este material" };
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

