import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Configuração do sitemap.xml para indexação
 *
 * Este arquivo gera automaticamente o sitemap XML com todas as páginas
 * públicas que devem ser indexadas pelos motores de busca.
 * No Next.js 13+, este arquivo é automaticamente servido em /sitemap.xml.
 *
 * O sitemap inclui:
 * - Páginas estáticas (home, listagem de materiais)
 * - Páginas dinâmicas (detalhes de materiais aprovados)
 *
 * Limites do Google:
 * - Máximo de 50.000 URLs por sitemap
 * - Máximo de 50MB por sitemap (não comprimido)
 * - Se exceder, usar sitemap index
 */

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://icti-share.vercel.app";

// Limite máximo de URLs por sitemap (recomendação do Google: 50.000)
const MAX_SITEMAP_URLS = 50000;

// Limite de materiais a buscar (ajustar conforme necessário)
const MAX_MATERIALS = 10000;

/**
 * Valida se uma URL é válida
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Gera o sitemap completo
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas principais
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0, // Prioridade máxima - página inicial
    },
    {
      url: `${baseUrl}/materiais`,
      lastModified: new Date(),
      changeFrequency: "daily", // Atualiza diariamente com novos materiais
      priority: 0.9, // Alta prioridade - página principal de conteúdo
    },
  ];

  // Buscar materiais aprovados para incluir no sitemap
  let materials: Array<{ id: string; updatedAt: Date }> = [];

  try {
    materials = await prisma.material.findMany({
      where: {
        status: "APPROVED", // Apenas materiais aprovados
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc", // Mais recentes primeiro
      },
      take: MAX_MATERIALS,
    });
  } catch (error) {
    // Log do erro mas não quebra o sitemap
    console.error("Erro ao buscar materiais para sitemap:", error);

    // Em caso de erro, retorna apenas as páginas estáticas
    // Isso garante que o sitemap sempre funcione, mesmo se o banco estiver indisponível
    return staticPages;
  }

  // Páginas dinâmicas de materiais
  const materialPages: MetadataRoute.Sitemap = materials
    .map((material) => {
      const url = `${baseUrl}/material/${material.id}`;

      // Validação básica da URL
      if (!isValidUrl(url)) {
        console.warn(`URL inválida ignorada no sitemap: ${url}`);
        return null;
      }

      return {
        url,
        lastModified: material.updatedAt || new Date(),
        changeFrequency: "weekly" as const, // Materiais mudam menos frequentemente
        priority: 0.7, // Prioridade média - conteúdo importante mas não crítico
      };
    })
    .filter((page): page is MetadataRoute.Sitemap[0] => page !== null);

  // Combinar todas as páginas
  const allPages = [...staticPages, ...materialPages];

  // Verificar se excede o limite do Google
  if (allPages.length > MAX_SITEMAP_URLS) {
    console.warn(
      `Sitemap excede ${MAX_SITEMAP_URLS} URLs. Considerar usar sitemap index.`
    );
    // Retornar apenas as primeiras URLs até o limite
    return allPages.slice(0, MAX_SITEMAP_URLS);
  }

  return allPages;
}
