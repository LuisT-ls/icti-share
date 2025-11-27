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
    prisma.download.count(),
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
    prisma.material.findMany({
      take: 10,
      orderBy: { downloadsCount: "desc" },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
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
