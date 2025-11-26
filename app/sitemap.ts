import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://icti-share.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Buscar materiais aprovados para incluir no sitemap
  let materials: Array<{ id: string; updatedAt: Date }> = [];
  try {
    materials = await prisma.material.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limitar para não sobrecarregar
    });
  } catch (error) {
    console.error("Erro ao buscar materiais para sitemap:", error);
  }

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/materiais`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Páginas dinâmicas de materiais
  const materialPages: MetadataRoute.Sitemap = materials.map((material) => ({
    url: `${baseUrl}/material/${material.id}`,
    lastModified: material.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...materialPages];
}
