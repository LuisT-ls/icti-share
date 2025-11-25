import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "@/lib/security/headers";

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
    const response = NextResponse.next();
    // Aplicar headers de segurança
    const securityHeaders = getSecurityHeaders();
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    return response;
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
    const response = NextResponse.redirect(loginUrl);
    // Aplicar headers de segurança mesmo no redirect
    const securityHeaders = getSecurityHeaders();
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Proteção de rotas admin
  if (pathname.startsWith("/admin") && session?.user?.role !== "ADMIN") {
    const response = NextResponse.redirect(new URL("/", req.url));
    // Aplicar headers de segurança
    const securityHeaders = getSecurityHeaders();
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  const response = NextResponse.next();
  // Aplicar headers de segurança
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
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
};

