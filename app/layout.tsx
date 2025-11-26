import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

// URL base da aplicação (usar variável de ambiente ou fallback)
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://icti-share.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
    template: "%s | ICTI Share",
  },
  description:
    "Plataforma acadêmica para compartilhamento de materiais de estudo. Acesse, compartilhe e aprenda juntos. Materiais organizados por curso, disciplina e semestre.",
  keywords: [
    "materiais acadêmicos",
    "compartilhamento",
    "estudos",
    "ICTI",
    "universidade",
    "educação",
    "PDF",
    "apostilas",
    "notas de aula",
  ],
  authors: [{ name: "ICTI Share" }],
  creator: "ICTI Share",
  publisher: "ICTI Share",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "ICTI Share",
    title:
      "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
    description:
      "Plataforma acadêmica para compartilhamento de materiais de estudo. Acesse, compartilhe e aprenda juntos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ICTI Share - Plataforma de Compartilhamento de Materiais Acadêmicos",
    description:
      "Plataforma acadêmica para compartilhamento de materiais de estudo. Acesse, compartilhe e aprenda juntos.",
    images: ["/og-image.jpg"],
    creator: "@ictishare",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Adicione aqui os códigos de verificação quando disponíveis
    // google: "seu-codigo-google",
    // yandex: "seu-codigo-yandex",
    // yahoo: "seu-codigo-yahoo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
