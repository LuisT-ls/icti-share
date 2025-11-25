"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { editProfileSchema } from "@/lib/validations/schemas";
import { sanitizeString } from "@/lib/security/sanitize";

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

