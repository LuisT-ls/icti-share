import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Verificar conexão na inicialização (apenas em produção para debug)
if (process.env.NODE_ENV === "production" && !globalForPrisma.prisma) {
  prisma.$connect().catch((error) => {
    console.error("❌ Erro ao conectar Prisma:", error);
  });
}
