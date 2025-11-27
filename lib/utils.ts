import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getBaseUrl } from "./seo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Gera URL de compartilhamento com parâmetros de tracking
 */
export function generateShareUrl(
  materialId: string,
  source: "whatsapp" | "twitter" | "facebook" | "linkedin" | "copy"
): string {
  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/share/${materialId}`;
  return `${shareUrl}?ref=share&source=${source}`;
}

/**
 * Gera URL completa do material para compartilhamento
 */
export function getMaterialUrl(materialId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/material/${materialId}`;
}
