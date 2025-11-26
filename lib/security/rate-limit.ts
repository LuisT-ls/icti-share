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
 * Limpa todas as entradas do rate limit store
 * Útil para casos de emergência ou reset manual
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Limpa entradas expiradas do rate limit store
 * Pode ser chamada manualmente se necessário
 */
export function cleanupRateLimitStore(): void {
  cleanupExpiredEntries();
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

  // Limpar entradas expiradas periodicamente (aumentado para 20% para limpeza mais frequente)
  if (Math.random() < 0.2) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(identifier);

  // Se não houver entrada ou se a entrada expirou, criar nova
  if (!entry || entry.resetTime < now) {
    // Se a entrada expirou, removê-la antes de criar nova
    if (entry && entry.resetTime < now) {
      rateLimitStore.delete(identifier);
    }

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

  // Entrada existente e ainda válida
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
 * Obtém o identificador para rate limiting de autenticação
 * Usa email como fallback quando IP não está disponível para evitar
 * que todos os usuários compartilhem o mesmo limite
 */
export function getAuthRateLimitIdentifier(
  ip: string | null,
  email: string | null
): string {
  // Se tivermos email, usar email (mais específico e único)
  if (email) {
    return `auth:email:${email.toLowerCase().trim()}`;
  }
  // Se não tiver email mas tiver IP, usar IP
  if (ip && ip !== "unknown") {
    return `auth:ip:${ip}`;
  }
  // Fallback: usar timestamp + random para evitar colisões
  // Isso só acontece em casos muito raros onde nem IP nem email estão disponíveis
  return `auth:fallback:${Date.now()}-${Math.random().toString(36).substring(7)}`;
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
