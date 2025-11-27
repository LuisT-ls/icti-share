"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeString } from "@/lib/security/sanitize";
import { z } from "zod";
import { CommentStatus } from "@prisma/client";

const createCommentSchema = z.object({
  materialId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z
    .string()
    .nullish()
    .transform((val) => (val === null || val === "" ? undefined : val)),
});

const updateCommentSchema = z.object({
  commentId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

/**
 * Criar um comentário
 */
export async function createComment(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Você precisa estar autenticado para comentar",
      };
    }

    const parentIdRaw = formData.get("parentId");
    const rawData = {
      materialId: formData.get("materialId") as string,
      content: formData.get("content") as string,
      // Transformar null ou string vazia em undefined
      parentId:
        parentIdRaw && parentIdRaw !== "" ? (parentIdRaw as string) : undefined,
    };

    let parsed;
    try {
      parsed = createCommentSchema.parse(rawData);
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        const errorDetails = zodError.errors.map((err) => {
          const baseErr = {
            path: err.path.join("."),
            message: err.message,
            code: err.code,
          };
          // Adicionar received e expected apenas se existirem
          if ("received" in err) {
            (baseErr as any).received = err.received;
          }
          if ("expected" in err) {
            (baseErr as any).expected = err.expected;
          }
          return baseErr;
        });

        const firstError = zodError.errors[0];
        const errorMessage = firstError
          ? `Campo "${firstError.path.join(".")}": ${firstError.message}`
          : "Dados inválidos. Verifique os campos.";

        return {
          success: false,
          error: errorMessage,
        };
      }
      throw zodError;
    }

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

    // Se for resposta, verificar se o comentário pai existe
    if (parsed.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parsed.parentId },
      });

      if (!parentComment || parentComment.materialId !== parsed.materialId) {
        return {
          success: false,
          error: "Comentário pai não encontrado",
        };
      }
    }

    // Sanitizar conteúdo
    const sanitizedContent = sanitizeString(parsed.content);

    // Criar comentário
    let comment;
    try {
      comment = await prisma.comment.create({
        data: {
          materialId: parsed.materialId,
          userId: session.user.id,
          content: sanitizedContent,
          parentId: parsed.parentId || null,
          status: session.user.role === "ADMIN" ? "APPROVED" : "APPROVED", // Por enquanto todos aprovados
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.error(
        "[createComment] ERRO ao criar no banco de dados:",
        dbError
      );
      if (dbError instanceof Error) {
        console.error("[createComment] Detalhes do erro do Prisma:", {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack?.substring(0, 500),
        });
      }
      throw dbError;
    }

    try {
      revalidatePath(`/material/${parsed.materialId}`);
    } catch (revalidateError) {
      console.error(
        "[createComment] Erro ao revalidar página:",
        revalidateError
      );
      // Continuar mesmo se revalidate falhar
    }

    return {
      success: true,
      comment,
    };
  } catch (error) {
    console.error("[createComment] ERRO ao criar comentário:", error);

    if (error instanceof z.ZodError) {
      const errorDetails = error.errors.map((err) => {
        const baseErr = {
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        };
        // Adicionar received e expected apenas se existirem
        if ("received" in err) {
          (baseErr as any).received = err.received;
        }
        if ("expected" in err) {
          (baseErr as any).expected = err.expected;
        }
        return baseErr;
      });

      console.error("[createComment] Erro de validação Zod detalhado:", {
        errorCount: error.errors.length,
        errors: errorDetails,
        allIssues: error.issues,
      });

      const firstError = error.errors[0];
      const errorMessage = firstError
        ? `Campo "${firstError.path.join(".")}": ${firstError.message}`
        : "Dados inválidos. Verifique os campos.";

      return {
        success: false,
        error: errorMessage,
      };
    }

    if (error instanceof Error) {
      console.error("[createComment] Detalhes do erro:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error("[createComment] Erro desconhecido:", {
        errorType: typeof error,
        errorValue: error,
      });
    }

    return {
      success: false,
      error: "Erro ao criar comentário. Tente novamente.",
    };
  }
}

/**
 * Atualizar um comentário
 */
export async function updateComment(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Você precisa estar autenticado",
      };
    }

    const rawData = {
      commentId: formData.get("commentId") as string,
      content: formData.get("content") as string,
    };

    const parsed = updateCommentSchema.parse(rawData);

    // Verificar se o comentário existe e pertence ao usuário
    const comment = await prisma.comment.findUnique({
      where: { id: parsed.commentId },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comentário não encontrado",
      };
    }

    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Você não tem permissão para editar este comentário",
      };
    }

    // Sanitizar conteúdo
    const sanitizedContent = sanitizeString(parsed.content);

    // Atualizar comentário
    const updatedComment = await prisma.comment.update({
      where: { id: parsed.commentId },
      data: {
        content: sanitizedContent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/material/${comment.materialId}`);

    return {
      success: true,
      comment: updatedComment,
    };
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos. Verifique os campos.",
      };
    }
    return {
      success: false,
      error: "Erro ao atualizar comentário. Tente novamente.",
    };
  }
}

/**
 * Deletar um comentário
 */
export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Você precisa estar autenticado",
      };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comentário não encontrado",
      };
    }

    // Verificar permissão (usuário ou admin)
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Você não tem permissão para deletar este comentário",
      };
    }

    // Deletar comentário (cascade deleta respostas)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/material/${comment.materialId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    return {
      success: false,
      error: "Erro ao deletar comentário. Tente novamente.",
    };
  }
}

/**
 * Moderar comentário (apenas admin)
 */
export async function moderateComment(
  commentId: string,
  status: CommentStatus
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Apenas administradores podem moderar comentários",
      };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comentário não encontrado",
      };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });

    revalidatePath(`/material/${comment.materialId}`);
    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao moderar comentário:", error);
    return {
      success: false,
      error: "Erro ao moderar comentário. Tente novamente.",
    };
  }
}

/**
 * Buscar comentários de um material
 */
export async function getComments(materialId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        materialId,
        status: "APPROVED",
        parentId: null, // Apenas comentários principais
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          where: {
            status: "APPROVED",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      comments,
    };
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return {
      success: false,
      error: "Erro ao buscar comentários",
      comments: [],
    };
  }
}
