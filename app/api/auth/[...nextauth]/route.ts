import { handlers } from "@/auth";

// Validar variáveis de ambiente antes de exportar handlers
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.error(
    "❌ AUTH_SECRET ou NEXTAUTH_SECRET não está configurado. NextAuth não funcionará."
  );
}

if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
  console.error(
    "❌ AUTH_URL ou NEXTAUTH_URL não está configurado. NextAuth não funcionará."
  );
}

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL não está configurado. NextAuth não funcionará."
  );
}

export const { GET, POST } = handlers;
