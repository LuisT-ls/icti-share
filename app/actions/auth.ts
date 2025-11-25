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
      error: rateLimitResult.error || "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  // Sanitizar e validar dados
  const rawData = {
    name: sanitizeString(formData.get("name") as string),
    email: sanitizeEmail(formData.get("email") as string),
    password: formData.get("password") as string, // Senha não é sanitizada (pode conter caracteres especiais)
  };

  const parsed = signupSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const { name, email, password } = parsed.data;

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
      },
    });

    // Fazer login automático após cadastro
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      redirect("/");
    } catch (error) {
      // Se o signIn lançar um redirect, deixar passar
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      // Se não conseguir fazer login, retornar sucesso mesmo assim
      // (usuário pode fazer login manualmente depois)
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }
  } catch (error) {
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
      error: rateLimitResult.error || "Muitas tentativas. Tente novamente mais tarde.",
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

