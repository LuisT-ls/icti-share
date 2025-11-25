"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

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
  data: {
    title?: string;
    description?: string;
    course?: string;
    discipline?: string;
    semester?: string;
    type?: string;
  }
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

    await prisma.material.update({
      where: { id: materialId },
      data: {
        title: data.title,
        description: data.description,
        course: data.course,
        discipline: data.discipline,
        semester: data.semester,
        type: data.type,
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

