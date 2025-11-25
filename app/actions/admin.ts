"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MaterialStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

/**
 * Verifica se o usuário atual é ADMIN
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Acesso negado. Apenas administradores podem realizar esta ação.");
  }
  return session;
}

/**
 * Aprova um material pendente
 */
export async function approveMaterial(materialId: string) {
  try {
    await requireAdmin();

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return {
        success: false,
        error: "Material não encontrado",
      };
    }

    await prisma.material.update({
      where: { id: materialId },
      data: { status: MaterialStatus.APPROVED },
    });

    revalidatePath("/admin");
    revalidatePath("/materiais");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao aprovar material:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao aprovar material",
    };
  }
}

/**
 * Rejeita um material pendente
 */
export async function rejectMaterial(materialId: string) {
  try {
    await requireAdmin();

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return {
        success: false,
        error: "Material não encontrado",
      };
    }

    await prisma.material.update({
      where: { id: materialId },
      data: { status: MaterialStatus.REJECTED },
    });

    revalidatePath("/admin");
    revalidatePath("/materiais");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao rejeitar material:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao rejeitar material",
    };
  }
}

/**
 * Remove um material (apaga do banco e do sistema de arquivos)
 */
export async function removeMaterial(materialId: string) {
  try {
    await requireAdmin();

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return {
        success: false,
        error: "Material não encontrado",
      };
    }

    // Deletar arquivo físico se existir
    if (existsSync(material.path)) {
      try {
        await unlink(material.path);
      } catch (fileError) {
        console.error("Erro ao deletar arquivo físico:", fileError);
        // Continua mesmo se não conseguir deletar o arquivo
      }
    }

    // Deletar do banco (cascade vai deletar downloads também)
    await prisma.material.delete({
      where: { id: materialId },
    });

    revalidatePath("/admin");
    revalidatePath("/materiais");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao remover material:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao remover material",
    };
  }
}

/**
 * Altera o role de um usuário
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const session = await requireAdmin();

    // Não permitir que um admin remova seu próprio role de admin
    if (session.user.id === userId && newRole !== "ADMIN") {
      return {
        success: false,
        error: "Você não pode remover seu próprio acesso de administrador",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao atualizar role do usuário:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar role do usuário",
    };
  }
}

/**
 * Busca materiais pendentes
 */
export async function getPendingMaterials() {
  try {
    await requireAdmin();

    const materials = await prisma.material.findMany({
      where: { status: MaterialStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      materials,
    };
  } catch (error) {
    console.error("Erro ao buscar materiais pendentes:", error);
    return {
      success: false,
      error: "Erro ao buscar materiais pendentes",
      materials: [],
    };
  }
}

/**
 * Busca todos os usuários
 */
export async function getAllUsers() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            uploadedMaterials: true,
            downloads: true,
          },
        },
      },
    });

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return {
      success: false,
      error: "Erro ao buscar usuários",
      users: [],
    };
  }
}

/**
 * Busca estatísticas administrativas
 */
export async function getAdminStats() {
  try {
    await requireAdmin();

    const [
      totalMaterials,
      pendingMaterials,
      approvedMaterials,
      totalDownloads,
      totalUsers,
      topMaterials,
    ] = await Promise.all([
      prisma.material.count(),
      prisma.material.count({ where: { status: MaterialStatus.PENDING } }),
      prisma.material.count({ where: { status: MaterialStatus.APPROVED } }),
      prisma.download.count(),
      prisma.user.count(),
      prisma.material.findMany({
        take: 10,
        orderBy: { downloadsCount: "desc" },
        select: {
          id: true,
          title: true,
          downloadsCount: true,
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalMaterials,
        pendingMaterials,
        approvedMaterials,
        totalDownloads,
        totalUsers,
        topMaterials,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas",
      stats: null,
    };
  }
}

