import { MetadataRoute } from "next";

/**
 * Configuração do robots.txt para controle de indexação
 *
 * Este arquivo define quais páginas os crawlers dos motores de busca
 * podem ou não indexar. No Next.js 13+, este arquivo é automaticamente
 * servido em /robots.txt quando a aplicação é construída.
 */

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://icti-share.vercel.app";

export default function robots(): MetadataRoute.Robots {
  // Rotas que devem ser bloqueadas para todos os bots
  const disallowedPaths = [
    "/api/", // APIs internas - não devem ser indexadas
    "/admin/", // Painel administrativo - área privada
    "/upload/", // Upload de materiais - requer autenticação
    "/meus-materiais/", // Materiais do usuário - área privada
    "/perfil/", // Perfil do usuário - área privada
    "/login", // Página de login - não precisa ser indexada
    "/signup", // Página de cadastro - não precisa ser indexada
    "/material/download/", // Downloads diretos - não devem ser indexados
  ];

  return {
    rules: [
      // Regras para Googlebot (bot do Google)
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: disallowedPaths,
      },
      // Regras para Googlebot-Image (bot de imagens do Google)
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: disallowedPaths,
      },
      // Regras para todos os outros bots
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
