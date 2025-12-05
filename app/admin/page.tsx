import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminContent } from "@/components/AdminContent";
import { MaterialStatus } from "@prisma/client";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Buscar todas as estatísticas e dados necessários
  const [
    totalMaterials,
    pendingMaterials,
    approvedMaterials,
    totalDownloads,
    totalUsers,
    adminCount,
    pendingMaterialsList,
    allUsers,
    topMaterials,
  ] = await Promise.all([
    prisma.material.count(),
    prisma.material.count({ where: { status: MaterialStatus.PENDING } }),
    prisma.material.count({ where: { status: MaterialStatus.APPROVED } }),
    // Contar apenas downloads de usuários autenticados (com userId)
    // Isso garante consistência com a contagem na seção de usuários
    prisma.download.count({
      where: {
        userId: { not: null },
        material: {
          status: MaterialStatus.APPROVED,
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.material.findMany({
      where: { status: MaterialStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            uploadedMaterials: true,
            downloads: true,
          },
        },
      },
    }),
    // Buscar top materiais usando contagem real da tabela downloads
    // ao invés do campo downloadsCount que pode estar desatualizado
    (async () => {
      // Primeiro, buscar contagem de downloads por material (apenas usuários autenticados)
      const downloadCounts = await prisma.download.groupBy({
        by: ["materialId"],
        where: {
          userId: { not: null },
        },
        _count: {
          materialId: true,
        },
      });

      // Criar um mapa de materialId -> contagem
      const countMap = new Map(
        downloadCounts.map((item) => [item.materialId, item._count.materialId])
      );

      // Buscar todos os materiais aprovados
      const materials = await prisma.material.findMany({
        where: {
          status: MaterialStatus.APPROVED,
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Adicionar contagem de downloads e ordenar
      const materialsWithCounts = materials.map((material) => ({
        ...material,
        _count: {
          downloads: countMap.get(material.id) ?? 0,
        },
      }));

      // Ordenar por contagem de downloads (apenas usuários autenticados) e pegar top 10
      return materialsWithCounts
        .sort((a, b) => (b._count?.downloads ?? 0) - (a._count?.downloads ?? 0))
        .slice(0, 10);
    })(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <AdminContent
          totalMaterials={totalMaterials}
          pendingMaterials={pendingMaterials}
          approvedMaterials={approvedMaterials}
          totalDownloads={totalDownloads}
          totalUsers={totalUsers}
          adminCount={adminCount}
          pendingMaterialsList={pendingMaterialsList}
          allUsers={allUsers}
          topMaterials={topMaterials}
          currentUserId={session.user.id}
        />
      </main>
      <Footer />
    </div>
  );
}

// Revalidação a cada 30 segundos para manter dados atualizados no admin
export const revalidate = 30;
