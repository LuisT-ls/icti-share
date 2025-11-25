/**
 * Rate Limiting simples em memória
 * Para produção, considere usar Redis ou um serviço dedicado
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Armazenamento em memória (Map)
// Em produção, use Redis ou outro sistema distribuído
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Número máximo de requisições
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

/**
 * Limpa entradas expiradas do store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Verifica e aplica rate limiting
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { windowMs, maxRequests } = options;
  const now = Date.now();

  // Limpar entradas expiradas periodicamente
  if (Math.random() < 0.1) {
    // 10% de chance de limpar (para não fazer sempre)
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // Nova janela de tempo
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Entrada existente
  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: "Muitas requisições. Tente novamente mais tarde.",
    };
  }

  // Incrementar contador
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Obtém o identificador único para rate limiting
 * Combina IP e userId (se disponível)
 */
export function getRateLimitIdentifier(
  ip: string | null,
  userId: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || "unknown"}`;
}

/**
 * Configurações pré-definidas de rate limiting
 */
export const RATE_LIMIT_CONFIGS = {
  // Autenticação: 5 tentativas por 15 minutos
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
  },
  // Download: 20 downloads por minuto
  DOWNLOAD: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20,
  },
  // Upload: 5 uploads por hora
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 5,
  },
  // API geral: 100 requisições por minuto
  API: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100,
  },
} as const;

