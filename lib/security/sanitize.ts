/**
 * Utilitários de sanitização de inputs
 * Previne XSS e outros ataques de injeção
 */

/**
 * Remove ou escapa caracteres perigosos de uma string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    // Remove caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Remove tags HTML/script (básico)
    .replace(/<[^>]*>/g, "")
    // Escapa caracteres especiais que podem ser usados em SQL/HTML
    .replace(/['"\\]/g, "");
}

/**
 * Sanitiza um objeto removendo caracteres perigosos de strings
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[typeof key];
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(
        sanitized[key] as Record<string, unknown>
      ) as T[typeof key];
    }
  }

  return sanitized;
}

/**
 * Sanitiza um nome de arquivo removendo caracteres perigosos
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== "string") {
    return "file";
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+|\.+$/g, "") // Remove pontos no início/fim
    .substring(0, 255) // Limita tamanho
    .trim() || "file";
}

/**
 * Valida e sanitiza um email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") {
    return "";
  }

  return email.toLowerCase().trim().substring(0, 255);
}

