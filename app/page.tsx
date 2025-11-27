import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cachedQuery, generateCacheKey } from "@/lib/cache";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedMaterialsSection } from "@/components/FeaturedMaterialsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://icti-share.vercel.app";

export const metadata: Metadata = {
  title: "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
  description:
    "Plataforma acadêmica para compartilhamento de materiais de estudo. Acesse, compartilhe e aprenda juntos. Materiais organizados por curso, disciplina e semestre.",
  openGraph: {
    title:
      "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
    description:
      "Plataforma acadêmica para compartilhamento de materiais de estudo. Acesse, compartilhe e aprenda juntos.",
    url: baseUrl,
    siteName: "ICTI Share",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
    description:
      "Plataforma acadêmica para compartilhamento de materiais de estudo. Acesse, compartilhe e aprenda juntos.",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

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
  // Usar cache para melhorar performance
  let featuredMaterials: MaterialWithUploader[] = [];
  try {
    const cacheKey = generateCacheKey("featured_materials", { limit: 6 });
    featuredMaterials = await cachedQuery(
      cacheKey,
      async () => {
        return await prisma.material.findMany({
          take: 6,
          where: { status: "APPROVED" },
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
      },
      5 * 60 * 1000 // Cache por 5 minutos
    );
  } catch (error) {
    // Log do erro em produção (não expor detalhes ao usuário)
    console.error("Erro ao buscar materiais:", error);
    // Continuar com array vazio para não quebrar a página
    featuredMaterials = [];
  }

  // Structured Data (JSON-LD) para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ICTI Share",
    description:
      "Plataforma acadêmica para compartilhamento de materiais de estudo",
    url: baseUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

// Revalidação a cada 5 minutos para manter dados atualizados
export const revalidate = 300;
