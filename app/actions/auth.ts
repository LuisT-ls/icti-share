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
  getAuthRateLimitIdentifier,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";
import { sanitizeString, sanitizeEmail } from "@/lib/security/sanitize";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function signup(formData: FormData) {
  // Sanitizar e validar dados primeiro para obter o email
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

  const { email } = parsed.data;

  // Rate limiting - usar email como identificador (mais confiável que IP)
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip")?.trim() ||
    headersList.get("cf-connecting-ip")?.trim() ||
    null;

  const identifier = getAuthRateLimitIdentifier(ip, email);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.AUTH);

  if (!rateLimitResult.success) {
    console.warn("[RATE LIMIT] Signup bloqueado:", {
      identifier,
      ip,
      email,
      remaining: rateLimitResult.remaining,
      resetTime: new Date(rateLimitResult.resetTime).toISOString(),
    });
    return {
      error:
        rateLimitResult.error ||
        "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  const { name, password, course } = parsed.data;

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
  // Sanitizar e validar dados primeiro para obter o email
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

  // Rate limiting - usar email como identificador (mais confiável que IP)
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip")?.trim() ||
    headersList.get("cf-connecting-ip")?.trim() ||
    null;

  const identifier = getAuthRateLimitIdentifier(ip, email);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.AUTH);

  if (!rateLimitResult.success) {
    console.warn("[RATE LIMIT] Login bloqueado:", {
      identifier,
      ip,
      email,
      remaining: rateLimitResult.remaining,
      resetTime: new Date(rateLimitResult.resetTime).toISOString(),
    });
    return {
      error:
        rateLimitResult.error ||
        "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Se houver erro, retornar mensagem de erro
    if (result?.error) {
      console.error("[LOGIN] Erro no signIn:", result.error, result);
      // CredentialsSignin significa que o authorize retornou null
      if (result.error === "CredentialsSignin") {
        return {
          error:
            "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
        };
      }
      // Outros erros do NextAuth
      const errorMessage =
        result.error === "Configuration"
          ? "Erro de configuração do servidor. Entre em contato com o suporte."
          : result.error === "AccessDenied"
            ? "Acesso negado. Verifique suas credenciais."
            : `Erro ao fazer login: ${result.error}`;

      return {
        error: errorMessage,
      };
    }

    // Se não houver erro, considerar como sucesso
    // No NextAuth v5, quando redirect: false e não há erro, o login foi bem-sucedido
    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      error:
        error instanceof Error
          ? `Erro ao fazer login: ${error.message}`
          : "Erro ao fazer login. Tente novamente.",
    };
  }
}

export async function logout() {
  await signOut({ redirect: false });
}

/**
 * Solicita recuperação de senha
 * Envia email com token de reset
 */
export async function requestPasswordReset(formData: FormData) {
  const rawData = {
    email: sanitizeEmail(formData.get("email") as string),
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const { email } = parsed.data;

  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip")?.trim() ||
    headersList.get("cf-connecting-ip")?.trim() ||
    null;

  const identifier = getAuthRateLimitIdentifier(ip, email);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIGS.AUTH);

  if (!rateLimitResult.success) {
    // Por segurança, não revelar se o email existe ou não
    // Sempre retornar sucesso para evitar enumeração de emails
    return {
      success: true,
      message:
        "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
    };
  }

  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // Isso evita enumeração de emails
    if (!user || !user.passwordHash) {
      // Usuário não existe ou não tem senha (OAuth only)
      return {
        success: true,
        message:
          "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
      };
    }

    // Gerar token seguro
    const token = randomBytes(32).toString("hex");

    // Expira em 1 hora
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Deletar tokens antigos do usuário
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Criar novo token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    // Enviar email
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      token,
      name: user.name,
    });

    if (!emailResult.success) {
      // Se falhar ao enviar email, deletar o token criado
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          token,
        },
      });

      console.error("Erro ao enviar email de recuperação:", emailResult.error);
      return {
        success: false,
        error: "Erro ao enviar email. Tente novamente mais tarde.",
      };
    }

    return {
      success: true,
      message:
        "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
    };
  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    // Por segurança, sempre retornar sucesso
    return {
      success: true,
      message:
        "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
    };
  }
}

/**
 * Reseta a senha usando o token
 */
export async function resetPassword(formData: FormData) {
  const rawData = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const { token, password } = parsed.data;

  try {
    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return {
        success: false,
        error: "Token inválido ou expirado.",
      };
    }

    // Verificar se o token expirou
    if (resetToken.expires < new Date()) {
      // Deletar token expirado
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return {
        success: false,
        error: "Token expirado. Solicite um novo link de recuperação.",
      };
    }

    // Verificar se o usuário ainda existe e tem senha
    if (!resetToken.user.passwordHash) {
      return {
        success: false,
        error: "Este usuário não pode redefinir senha.",
      };
    }

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Atualizar senha e deletar token em uma transação
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      // Deletar todos os tokens de reset do usuário (por segurança)
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return {
      success: true,
      message: "Senha redefinida com sucesso! Você já pode fazer login.",
    };
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return {
      success: false,
      error: "Erro ao redefinir senha. Tente novamente.",
    };
  }
}
