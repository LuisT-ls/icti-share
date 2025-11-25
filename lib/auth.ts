import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Validar variáveis de ambiente necessárias
const requiredEnvVars = {
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL || process.env.NEXTAUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
};

if (!requiredEnvVars.AUTH_SECRET) {
  console.error(
    "❌ AUTH_SECRET ou NEXTAUTH_SECRET não está configurado. NextAuth não funcionará."
  );
}

if (!requiredEnvVars.AUTH_URL) {
  console.error(
    "❌ AUTH_URL ou NEXTAUTH_URL não está configurado. NextAuth não funcionará."
  );
}

if (!requiredEnvVars.DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL não está configurado. NextAuth não funcionará."
  );
}

// Criar adapter apenas se DATABASE_URL estiver configurado
let adapter: any = undefined;
if (requiredEnvVars.DATABASE_URL) {
  try {
    adapter = PrismaAdapter(prisma) as any;
  } catch (error) {
    console.error("❌ Erro ao criar PrismaAdapter:", error);
  }
}

export const authConfig: NextAuthConfig = {
  // Não usar adapter com JWT strategy - pode causar problemas
  // adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  secret: requiredEnvVars.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Verificar se DATABASE_URL está configurado
          if (!process.env.DATABASE_URL) {
            console.error("❌ DATABASE_URL não está configurado");
            throw new Error("DATABASE_URL não configurado");
          }

          if (!credentials?.email || !credentials?.password) {
            console.error("Credenciais incompletas");
            return null;
          }

          const parsed = loginSchema.safeParse(credentials);

          if (!parsed.success) {
            console.error(
              "Erro na validação de credenciais:",
              parsed.error.errors
            );
            return null;
          }

          const { email, password } = parsed.data;

          // Normalizar email (já vem normalizado do schema, mas garantir)
          const normalizedEmail = email.toLowerCase().trim();

          console.log(`[AUTH] Tentativa de login para: ${normalizedEmail}`);

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            console.error(`[AUTH] Usuário não encontrado: ${normalizedEmail}`);
            return null;
          }

          if (!user.passwordHash) {
            console.error(
              `[AUTH] Usuário sem senha cadastrada: ${normalizedEmail}`
            );
            return null;
          }

          console.log(`[AUTH] Verificando senha para usuário: ${user.id}`);

          const isValidPassword = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isValidPassword) {
            console.error(`[AUTH] Senha inválida para: ${normalizedEmail}`);
            return null;
          }

          console.log(`[AUTH] ✅ Login bem-sucedido para: ${normalizedEmail}`);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] ❌ Erro no authorize:", error);
          if (error instanceof Error) {
            console.error("[AUTH] Detalhes:", error.message);
            console.error("[AUTH] Stack:", error.stack);
          }
          // Não retornar null em caso de erro de conexão - lançar erro
          if (
            error instanceof Error &&
            error.message.includes("DATABASE_URL")
          ) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
