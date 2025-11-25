import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedMaterialsSection } from "@/components/FeaturedMaterialsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import type { Prisma } from "@prisma/client";

type MaterialWithUploader = Prisma.MaterialGetPayload<{
  include: {
    uploadedBy: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

export default async function Home() {
  const session = await getServerSession();

  // Buscar materiais em destaque (mais recentes ou mais baixados)
  // Tratamento de erro para evitar 500 se o banco não estiver disponível
  let featuredMaterials: MaterialWithUploader[] = [];
  try {
    featuredMaterials = await prisma.material.findMany({
      take: 6,
      orderBy: [{ downloadsCount: "desc" }, { createdAt: "desc" }],
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    // Log do erro em produção (não expor detalhes ao usuário)
    console.error("Erro ao buscar materiais:", error);
    // Continuar com array vazio para não quebrar a página
    featuredMaterials = [];
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection hasSession={!!session} />
        <FeaturedMaterialsSection materials={featuredMaterials} />
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}
