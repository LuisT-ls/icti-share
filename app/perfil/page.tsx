import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfileContent } from "@/components/ProfileContent";

export default async function PerfilPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Buscar estatísticas do usuário
  const [materialsCount, downloadsCount] = await Promise.all([
    prisma.material.count({
      where: { uploadedById: session.user.id },
    }),
    prisma.download.count({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <ProfileContent
          userName={session.user.name}
          userEmail={session.user.email}
          userRole={session.user.role}
          materialsCount={materialsCount}
          downloadsCount={downloadsCount}
        />
      </main>
      <Footer />
    </div>
  );
}
