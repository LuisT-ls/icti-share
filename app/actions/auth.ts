"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signupSchema, loginSchema } from "@/lib/validations/schemas";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";
import { sanitizeString, sanitizeEmail } from "@/lib/security/sanitize";

export async function signup(formData: FormData) {
  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    null;

  const identifier = getRateLimitIdentifier(ip, null);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.AUTH);

  if (!rateLimitResult.success) {
    return {
      error:
        rateLimitResult.error ||
        "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  // Sanitizar e validar dados
  const rawData = {
    name: sanitizeString(formData.get("name") as string),
    email: sanitizeEmail(formData.get("email") as string),
    password: formData.get("password") as string, // Senha não é sanitizada (pode conter caracteres especiais)
    course: (formData.get("course") as string)?.trim() || "", // Curso vem de select, apenas trim
  };

  const parsed = signupSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const { name, email, password, course } = parsed.data;

  try {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: "Este email já está cadastrado",
      };
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.USUARIO,
        course,
      },
    });

    // Fazer login automático após cadastro
    // Se falhar, ainda retornamos sucesso pois o usuário foi criado
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // Se o signIn funcionou, redirecionar
      redirect("/");
    } catch (error) {
      // Se o signIn lançar um redirect, deixar passar (isso é esperado)
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }

      // Se houver outro erro no login, logar mas não falhar
      // O usuário foi criado com sucesso, então retornamos sucesso
      console.warn("Usuário criado, mas login automático falhou:", error);

      // Retornar sucesso mesmo se o login automático falhar
      // O usuário pode fazer login manualmente depois
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        message: "Conta criada com sucesso! Você pode fazer login agora.",
      };
    }
  } catch (error) {
    // Verificar se é um erro de redirect (isso é esperado e não é um erro real)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error; // Deixar o redirect passar
    }

    // Verificar se o erro é porque o usuário já existe
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        error: "Este email já está cadastrado",
      };
    }

    console.error("Erro ao criar usuário:", error);
    return {
      error: "Erro ao criar conta. Tente novamente.",
    };
  }
}

export async function login(formData: FormData) {
  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    null;

  const identifier = getRateLimitIdentifier(ip, null);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.AUTH);

  if (!rateLimitResult.success) {
    return {
      error:
        rateLimitResult.error ||
        "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  // Sanitizar e validar dados
  const rawData = {
    email: sanitizeEmail(formData.get("email") as string),
    password: formData.get("password") as string, // Senha não é sanitizada
  };

  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const { email, password } = parsed.data;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        error: "Email ou senha incorretos",
      };
    }

    redirect("/");
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      error: "Erro ao fazer login. Tente novamente.",
    };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
