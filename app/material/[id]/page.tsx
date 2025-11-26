import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import { generateMaterialStructuredData, getBaseUrl } from "@/lib/seo";

const baseUrl = getBaseUrl();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!material) {
    return {
      title: "Material não encontrado",
    };
  }

  const title = `${material.title} - ICTI Share`;
  const description =
    material.description ||
    `Material acadêmico: ${material.title}. ${material.course ? `Curso: ${material.course}.` : ""} ${material.discipline ? `Disciplina: ${material.discipline}.` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/material/${id}`,
      siteName: "ICTI Share",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "pt_BR",
      type: "article",
      publishedTime: material.createdAt.toISOString(),
      modifiedTime: material.updatedAt.toISOString(),
      authors: material.uploadedBy?.name
        ? [material.uploadedBy.name]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`],
    },
  };
}

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!material) {
    notFound();
  }

  // Structured Data (JSON-LD) para SEO
  const jsonLd = generateMaterialStructuredData({
    title: material.title,
    description:
      material.description || `Material acadêmico: ${material.title}`,
    url: `${baseUrl}/material/${material.id}`,
    author: material.uploadedBy?.name || "ICTI Share",
    datePublished: material.createdAt.toISOString(),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-4xl">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <CardTitle className="text-3xl md:text-4xl font-bold leading-tight">
                  {material.title}
                </CardTitle>
                {material.description && (
                  <CardDescription className="text-base md:text-lg leading-relaxed">
                    {material.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
                <FileText className="h-8 w-8 text-accent-light" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8">
            {/* Metadados */}
            <div className="grid md:grid-cols-2 gap-4">
              {material.course && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <GraduationCap className="h-5 w-5 text-accent-light flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Curso
                    </span>
                    <p className="text-sm font-medium mt-0.5">
                      {material.course}
                    </p>
                  </div>
                </div>
              )}
              {material.discipline && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 text-accent-light flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Disciplina
                    </span>
                    <p className="text-sm font-medium mt-0.5">
                      {material.discipline}
                    </p>
                  </div>
                </div>
              )}
              {material.semester && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CalendarDays className="h-5 w-5 text-accent-light flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Semestre
                    </span>
                    <p className="text-sm font-medium mt-0.5">
                      {material.semester}
                    </p>
                  </div>
                </div>
              )}
              {material.type && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Tag className="h-5 w-5 text-accent-light flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Tipo
                    </span>
                    <p className="text-sm font-medium mt-0.5">
                      {material.type}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="border-t border-border/50 pt-6 space-y-3">
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-muted/30">
                <Download className="h-4 w-4 text-accent-light" />
                <span className="text-sm font-medium">
                  <span className="text-muted-foreground">Downloads: </span>
                  <span className="text-foreground">
                    {material.downloadsCount}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-muted/30">
                <Calendar className="h-4 w-4 text-accent-light" />
                <span className="text-sm font-medium">
                  <span className="text-muted-foreground">Publicado </span>
                  <span className="text-foreground">
                    {formatDistanceToNow(new Date(material.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-muted/30">
                <FileText className="h-4 w-4 text-accent-light" />
                <span className="text-sm font-medium">
                  <span className="text-muted-foreground">Tamanho: </span>
                  <span className="text-foreground">
                    {formatBytes(material.size)}
                  </span>
                </span>
              </div>
              {material.uploadedBy && (
                <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-muted/30">
                  <User className="h-4 w-4 text-accent-light" />
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground">Por: </span>
                    <span className="text-foreground">
                      {material.uploadedBy.name || material.uploadedBy.email}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Botão de Download */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-border/50">
              <Button
                asChild
                size="lg"
                className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] sm:hover:scale-105"
              >
                <Link
                  href={`/material/download/${material.id}`}
                  prefetch={false}
                  className="flex items-center justify-center"
                >
                  <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Baixar Material</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-semibold border-2 hover:bg-accent transition-all duration-200 active:scale-[0.98] sm:hover:scale-105"
              >
                <Link
                  href="/materiais"
                  className="flex items-center justify-center"
                >
                  Voltar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
