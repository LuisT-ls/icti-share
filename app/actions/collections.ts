"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCollectionSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(50, "O título deve ter no máximo 50 caracteres"),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export async function createCollection(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      isPublic: formData.get("isPublic") === "true",
    };

    const validated = createCollectionSchema.parse(rawData);

    const collection = await prisma.collection.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    revalidatePath("/colecoes");
    return { success: true, collection };
  } catch (error) {
    console.error("[CREATE COLLECTION ERROR]", error);
    // Return detailed error for debugging
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro ao criar coleção: ${errorMessage}` };
  }
}

export async function getUserCollections() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function addToCollection(
  collectionId: string,
  materialId: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    // Verificar propriedade
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== session.user.id) {
      return {
        success: false,
        error: "Coleção não encontrada ou permissão negada",
      };
    }

    await prisma.collectionItem.create({
      data: {
        collectionId,
        materialId,
      },
    });

    revalidatePath(`/colecoes/${collectionId}`);
    return { success: true };
  } catch (error) {
    if ((error as any).code === "P2002") {
      return { success: false, error: "Material já está na coleção" };
    }
    console.error("Erro ao adicionar à coleção:", error);
    return { success: false, error: "Erro ao adicionar à coleção" };
  }
}

export async function removeFromCollection(
  collectionId: string,
  materialId: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    // Verificar propriedade
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== session.user.id) {
      return {
        success: false,
        error: "Coleção não encontrada ou permissão negada",
      };
    }

    await prisma.collectionItem.delete({
      where: {
        collectionId_materialId: {
          collectionId,
          materialId,
        },
      },
    });

    revalidatePath(`/colecoes/${collectionId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover da coleção:", error);
    return { success: false, error: "Erro ao remover da coleção" };
  }
}

export async function getCollectionDetails(id: string) {
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true },
      },
      items: {
        include: {
          material: {
            include: {
              uploadedBy: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!collection) return null;

  // Verificar visibilidade
  if (!collection.isPublic) {
    const session = await auth();
    if (collection.userId !== session?.user?.id) {
      return null;
    }
  }

  return collection;
}

export async function deleteCollection(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection || collection.userId !== session.user.id) {
      return { success: false, error: "Permissão negada" };
    }

    await prisma.collection.delete({ where: { id } });
    revalidatePath("/colecoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir coleção:", error);
    return { success: false, error: "Erro ao excluir coleção" };
  }
}
