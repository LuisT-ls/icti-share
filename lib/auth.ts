import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
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
  adapter,
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
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
