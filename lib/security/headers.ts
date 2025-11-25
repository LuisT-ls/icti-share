/**
 * Configuração de headers de segurança
 */

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Gera headers de segurança padrão
 */
export function getSecurityHeaders(): SecurityHeaders {
  const headers: SecurityHeaders = {
    // Previne clickjacking
    "X-Frame-Options": "DENY",
    
    // Previne MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Habilita XSS protection (legado, mas ainda útil)
    "X-XSS-Protection": "1; mode=block",
    
    // Política de referrer
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Permissions Policy (anteriormente Feature-Policy)
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    
    // Content Security Policy
    "Content-Security-Policy": getCSP(),
    
    // Strict Transport Security (apenas em HTTPS)
    // Nota: HSTS deve ser configurado no servidor/proxy em produção
  };

  return headers;
}

/**
 * Gera Content Security Policy
 * Ajuste conforme necessário para sua aplicação
 */
function getCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  // Em desenvolvimento, permitir mais flexibilidade
  if (isDev) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js precisa
      "style-src 'self' 'unsafe-inline'", // Tailwind precisa
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ");
  }

  // Em produção, política mais restritiva
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Tailwind ainda precisa
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

/**
 * Aplica headers de segurança a uma resposta Next.js
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

