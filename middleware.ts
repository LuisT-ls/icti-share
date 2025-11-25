import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Headers de segurança inline para reduzir tamanho do bundle
function getSecurityHeaders(): Record<string, string> {
  const isDev = process.env.NODE_ENV === "development";

  const csp = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Content-Security-Policy": csp,
  };
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Rotas públicas
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/api/auth",
    "/material/download",
    "/materiais",
    "/material",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Se for rota pública, permitir acesso
  if (isPublicRoute) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Rotas protegidas
  const protectedRoutes = ["/upload", "/meus-materiais", "/admin", "/perfil"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirecionar para login se não estiver autenticado
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Proteção de rotas admin
  if (pathname.startsWith("/admin") && session?.user?.role !== "ADMIN") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", req.url)));
  }

  return applySecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs", // Usar Node.js runtime para suportar NextAuth com Prisma
};
