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
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  commentId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

/**
 * Criar um comentário
 */
export async function createComment(formData: FormData) {
  console.log("[createComment] Iniciando criação de comentário");

  try {
    console.log("[createComment] Verificando autenticação...");
    const session = await auth();

    console.log("[createComment] Resultado da autenticação:", {
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    });

    if (!session?.user?.id) {
      console.error("[createComment] Usuário não autenticado");
      return {
        success: false,
        error: "Você precisa estar autenticado para comentar",
      };
    }

    console.log("[createComment] Extraindo dados do FormData...");
    const rawData = {
      materialId: formData.get("materialId") as string,
      content: formData.get("content") as string,
      parentId: formData.get("parentId") as string | undefined,
    };

    console.log("[createComment] Dados extraídos (tipos e valores):", {
      materialId: {
        value: rawData.materialId,
        type: typeof rawData.materialId,
        isString: typeof rawData.materialId === "string",
        length: rawData.materialId?.length,
        isEmpty: !rawData.materialId || rawData.materialId.trim().length === 0,
      },
      content: {
        value: rawData.content,
        type: typeof rawData.content,
        isString: typeof rawData.content === "string",
        length: rawData.content?.length,
        isEmpty: !rawData.content || rawData.content.trim().length === 0,
        preview: rawData.content?.substring(0, 100),
      },
      parentId: {
        value: rawData.parentId,
        type: typeof rawData.parentId,
        isString: typeof rawData.parentId === "string",
        isUndefined: rawData.parentId === undefined,
        isEmpty: rawData.parentId === "",
      },
    });

    console.log("[createComment] Validando dados com Zod...");
    let parsed;
    try {
      parsed = createCommentSchema.parse(rawData);
      console.log("[createComment] Dados validados com sucesso:", {
        materialId: parsed.materialId,
        contentLength: parsed.content.length,
        hasParentId: !!parsed.parentId,
      });
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        console.error("[createComment] ERRO de validação Zod:", {
          errors: zodError.errors,
          issues: zodError.issues.map((issue) => {
            const baseIssue = {
              path: issue.path,
              message: issue.message,
              code: issue.code,
            };
            // Adicionar received e expected apenas se existirem
            if ("received" in issue) {
              (baseIssue as any).received = issue.received;
            }
            if ("expected" in issue) {
              (baseIssue as any).expected = issue.expected;
            }
            return baseIssue;
          }),
          formData: {
            materialId: rawData.materialId,
            content: rawData.content,
            parentId: rawData.parentId,
          },
        });
      }
      throw zodError;
    }

    // Verificar se o material existe
    console.log("[createComment] Verificando se material existe...", {
      materialId: parsed.materialId,
    });

    const material = await prisma.material.findUnique({
      where: { id: parsed.materialId },
    });

    console.log("[createComment] Resultado da busca do material:", {
      found: !!material,
      materialId: material?.id,
      materialTitle: material?.title,
    });

    if (!material) {
      console.error(
        "[createComment] Material não encontrado:",
        parsed.materialId
      );
      return {
        success: false,
        error: "Material não encontrado",
      };
    }

    // Se for resposta, verificar se o comentário pai existe
    if (parsed.parentId) {
      console.log("[createComment] Verificando comentário pai...", {
        parentId: parsed.parentId,
      });

      const parentComment = await prisma.comment.findUnique({
        where: { id: parsed.parentId },
      });

      console.log("[createComment] Resultado da busca do comentário pai:", {
        found: !!parentComment,
        parentMaterialId: parentComment?.materialId,
        currentMaterialId: parsed.materialId,
        matches: parentComment?.materialId === parsed.materialId,
      });

      if (!parentComment || parentComment.materialId !== parsed.materialId) {
        console.error(
          "[createComment] Comentário pai inválido ou não encontrado"
        );
        return {
          success: false,
          error: "Comentário pai não encontrado",
        };
      }
    }

    // Sanitizar conteúdo
    console.log("[createComment] Sanitizando conteúdo...", {
      originalLength: parsed.content.length,
    });

    const sanitizedContent = sanitizeString(parsed.content);

    console.log("[createComment] Conteúdo sanitizado:", {
      sanitizedLength: sanitizedContent.length,
      sanitizedPreview: sanitizedContent.substring(0, 100),
    });

    // Criar comentário
    console.log("[createComment] Criando comentário no banco de dados...", {
      materialId: parsed.materialId,
      userId: session.user.id,
      contentLength: sanitizedContent.length,
      hasParentId: !!parsed.parentId,
    });

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

      console.log("[createComment] Comentário criado no banco com sucesso:", {
        commentId: comment.id,
        materialId: comment.materialId,
        userId: comment.userId,
        contentLength: comment.content.length,
        hasParentId: !!comment.parentId,
        userEmail: comment.user.email,
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

    console.log("[createComment] Revalidando página...");
    try {
      revalidatePath(`/material/${parsed.materialId}`);
      console.log("[createComment] Página revalidada com sucesso");
    } catch (revalidateError) {
      console.error(
        "[createComment] Erro ao revalidar página:",
        revalidateError
      );
      // Continuar mesmo se revalidate falhar
    }

    console.log("[createComment] Preparando resposta de sucesso...");
    const response = {
      success: true,
      comment,
    };

    console.log("[createComment] Resposta preparada:", {
      success: response.success,
      hasComment: !!response.comment,
      commentId: response.comment?.id,
      commentKeys: response.comment ? Object.keys(response.comment) : [],
    });

    return response;
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
