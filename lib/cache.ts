/**
 * Sistema de cache em memória para queries frequentes
 * Pode ser facilmente substituído por Redis em produção
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 60 * 1000) {
    // TTL padrão: 60 segundos
    this.defaultTTL = defaultTTL;
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Define um valor no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Remove um valor do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtém ou executa uma função e cacheia o resultado
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fn();
    this.set(key, data, ttl);
    return data;
  }
}

// Instância global do cache
const cache = new MemoryCache(60 * 1000); // 60 segundos padrão

// Limpar cache expirado a cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      cache.cleanup();
    },
    5 * 60 * 1000
  );
}

/**
 * Gera uma chave de cache baseada em parâmetros
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join("|");
  return `${prefix}:${sortedParams}`;
}

/**
 * Cache helper para queries do Prisma
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return cache.getOrSet(key, queryFn, ttl);
}

/**
 * Invalida cache por prefixo
 */
export function invalidateCache(prefix: string): void {
  // Acessar o Map interno através de uma propriedade privada
  const cacheMap = (cache as any).cache as Map<string, CacheEntry<any>>;
  for (const key of cacheMap.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Limpa todo o cache
 */
export function clearCache(): void {
  cache.clear();
}

export default cache;
