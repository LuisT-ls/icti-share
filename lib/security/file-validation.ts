/**
 * Validação avançada de arquivos para prevenir uploads maliciosos
 */

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = ["application/pdf"] as const;
const ALLOWED_EXTENSIONS = [".pdf"] as const;

// Magic bytes para validação de tipo de arquivo
const FILE_SIGNATURES: Record<string, string[]> = {
  pdf: ["25504446"], // %PDF em hex
};

/**
 * Valida o tipo MIME do arquivo
 */
export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]);
}

/**
 * Valida a extensão do arquivo
 */
export function validateFileExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number]);
}

/**
 * Valida o tamanho do arquivo
 */
export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Valida os magic bytes do arquivo (primeiros bytes)
 * Isso previne uploads de arquivos com extensão falsa
 */
export function validateMagicBytes(
  buffer: Buffer,
  expectedType: "pdf"
): boolean {
  const signature = FILE_SIGNATURES[expectedType];
  if (!signature) {
    return false;
  }

  // Pegar os primeiros bytes
  const fileHeader = buffer.slice(0, 4).toString("hex").toUpperCase();

  // Verificar se corresponde a algum dos signatures esperados
  return signature.some((sig) => fileHeader.startsWith(sig.toUpperCase()));
}

/**
 * Valida se o nome do arquivo é seguro
 */
export function validateFilename(filename: string): boolean {
  if (!filename || filename.length === 0 || filename.length > 255) {
    return false;
  }

  // Verificar caracteres perigosos
  const dangerousChars = /[<>:"|?*\x00-\x1F]/;
  if (dangerousChars.test(filename)) {
    return false;
  }

  // Verificar se não é um caminho relativo
  if (filename.includes("..") || filename.startsWith("/") || filename.startsWith("\\")) {
    return false;
  }

  return true;
}

/**
 * Validação completa de arquivo
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateFile(file: File): Promise<FileValidationResult> {
  // 1. Validar tamanho
  if (!validateFileSize(file.size)) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
    };
  }

  // 2. Validar nome do arquivo
  if (!validateFilename(file.name)) {
    return {
      valid: false,
      error: "Nome de arquivo inválido ou contém caracteres perigosos",
    };
  }

  // 3. Validar extensão
  if (!validateFileExtension(file.name)) {
    return {
      valid: false,
      error: "Apenas arquivos PDF são permitidos",
    };
  }

  // 4. Validar MIME type
  if (!validateMimeType(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não permitido",
    };
  }

  // 5. Validar magic bytes (verificação mais segura)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!validateMagicBytes(buffer, "pdf")) {
      return {
        valid: false,
        error: "Arquivo não é um PDF válido. Verificação de conteúdo falhou.",
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: "Erro ao validar conteúdo do arquivo",
    };
  }

  return { valid: true };
}

