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
import { FileText, Download, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

// Página dinâmica para suportar searchParams
export const dynamic = "force-dynamic";

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
    robots: {
      index: true,
      follow: true,
    },
  };
}

type MaterialWithUploader = Prisma.MaterialGetPayload<{
  include: {
    uploadedBy: {
      select: {
        name: true;
      };
    };
  };
}>;

export default async function ShareLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string; source?: string }>;
}) {
  const { id } = await params;
  const { source } = await searchParams;

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
    notFound();
  }

  return <ShareLandingContent material={material} source={source} />;
}

function ShareLandingContent({
  material,
  source,
}: {
  material: MaterialWithUploader;
  source?: string;
}) {
  const sourceNames: Record<string, string> = {
    whatsapp: "WhatsApp",
    twitter: "Twitter",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    copy: "Link copiado",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Share2 className="h-12 w-12 text-accent-light" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              Material Compartilhado
            </CardTitle>
            {source && (
              <CardDescription className="text-base mt-2">
                Compartilhado via {sourceNames[source] || source}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">{material.title}</h2>
              {material.description && (
                <p className="text-muted-foreground">{material.description}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="flex-1">
                <Link
                  href={`/material/${material.id}?ref=share${source ? `&source=${source}` : ""}`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Ver Material
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/materiais">Explorar Mais</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
