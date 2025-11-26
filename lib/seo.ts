/**
 * Helper functions para SEO e metadados
 */

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://icti-share.vercel.app";

export function getBaseUrl(): string {
  return baseUrl;
}

/**
 * Gera metadados Open Graph para uma página
 */
export function generateOpenGraphMetadata({
  title,
  description,
  url,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "article";
}) {
  return {
    title,
    description,
    url,
    siteName: "ICTI Share",
    images: [
      {
        url: image || `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: "pt_BR",
    type,
  };
}

/**
 * Gera metadados Twitter Card para uma página
 */
export function generateTwitterMetadata({
  title,
  description,
  image,
  card = "summary_large_image",
}: {
  title: string;
  description: string;
  image?: string;
  card?: "summary" | "summary_large_image";
}) {
  return {
    card,
    title,
    description,
    images: [image || `${baseUrl}/og-image.jpg`],
  };
}

/**
 * Gera structured data (JSON-LD) para uma página de material
 */
export function generateMaterialStructuredData({
  title,
  description,
  url,
  author,
  datePublished,
  fileUrl,
}: {
  title: string;
  description: string;
  url: string;
  author: string;
  datePublished: string;
  fileUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    learningResourceType: "Educational Material",
    ...(fileUrl && {
      encoding: {
        "@type": "MediaObject",
        contentUrl: fileUrl,
        encodingFormat: "application/pdf",
      },
    }),
  };
}
