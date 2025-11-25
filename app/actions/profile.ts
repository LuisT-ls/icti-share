"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  editProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/schemas";
import { sanitizeString } from "@/lib/security/sanitize";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: "Não autenticado" };
  }

  // Sanitizar dados
  const rawData = {
    name: sanitizeString(formData.get("name") as string),
  };

  const parsed = editProfileSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/perfil");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: "Erro ao atualizar perfil" };
  }
}

export async function updatePassword(formData: FormData) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: "Não autenticado" };
  }

  // Validar dados
  const rawData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = changePasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    // Buscar usuário com senha
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "Usuário não encontrado ou não possui senha cadastrada",
      };
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      return {
        success: false,
        error: "Senha atual incorreta",
      };
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    revalidatePath("/perfil");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return { success: false, error: "Erro ao atualizar senha" };
  }
}
