"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createRatingSchema = z.object({
  materialId: z.string().min(1),
  value: z.number().int().min(1).max(5),
});

/**
 * Criar ou atualizar uma avaliação
 */
export async function createOrUpdateRating(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Você precisa estar autenticado para avaliar",
      };
    }

    const rawData = {
      materialId: formData.get("materialId") as string,
      value: parseInt(formData.get("value") as string, 10),
    };

    const parsed = createRatingSchema.parse(rawData);

    // Verificar se o material existe
    const material = await prisma.material.findUnique({
      where: { id: parsed.materialId },
    });

    if (!material) {
      return {
        success: false,
        error: "Material não encontrado",
      };
    }

    if (material.uploadedById === session.user.id) {
      return {
        success: false,
        error: "Você não pode avaliar seu próprio material",
      };
    }

    // Criar ou atualizar avaliação (upsert)
    const rating = await prisma.rating.upsert({
      where: {
        materialId_userId: {
          materialId: parsed.materialId,
          userId: session.user.id,
        },
      },
      update: {
        value: parsed.value,
      },
      create: {
        materialId: parsed.materialId,
        userId: session.user.id,
        value: parsed.value,
      },
    });

    revalidatePath(`/material/${parsed.materialId}`);

    return {
      success: true,
      rating,
    };
  } catch (error) {
    console.error("Erro ao criar/atualizar avaliação:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos. Verifique os campos.",
      };
    }
    return {
      success: false,
      error: "Erro ao avaliar. Tente novamente.",
    };
  }
}

/**
 * Buscar avaliação do usuário atual
 */
export async function getUserRating(materialId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: true,
        rating: null,
      };
    }

    const rating = await prisma.rating.findUnique({
      where: {
        materialId_userId: {
          materialId,
          userId: session.user.id,
        },
      },
    });

    return {
      success: true,
      rating,
    };
  } catch (error) {
    console.error("Erro ao buscar avaliação do usuário:", error);
    return {
      success: false,
      error: "Erro ao buscar avaliação",
      rating: null,
    };
  }
}

/**
 * Buscar estatísticas de avaliação de um material
 */
export async function getRatingStats(materialId: string) {
  try {
    const [ratings, average] = await Promise.all([
      prisma.rating.findMany({
        where: { materialId },
        select: { value: true },
      }),
      prisma.rating.aggregate({
        where: { materialId },
        _avg: {
          value: true,
        },
        _count: {
          value: true,
        },
      }),
    ]);

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: ratings.filter((r) => r.value === star).length,
    }));

    return {
      success: true,
      stats: {
        average: average._avg.value || 0,
        total: average._count.value || 0,
        distribution,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de avaliação:", error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas",
      stats: {
        average: 0,
        total: 0,
        distribution: [1, 2, 3, 4, 5].map((star) => ({ star, count: 0 })),
      },
    };
  }
}
