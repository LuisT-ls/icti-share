import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, User, BookOpen, GraduationCap, CalendarDays, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{material.title}</CardTitle>
                {material.description && (
                  <CardDescription className="text-base mt-4">
                    {material.description}
                  </CardDescription>
                )}
              </div>
              <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0 ml-4" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Metadados */}
            <div className="grid md:grid-cols-2 gap-4">
              {material.course && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Curso:</span>
                  <span>{material.course}</span>
                </div>
              )}
              {material.discipline && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Disciplina:</span>
                  <span>{material.discipline}</span>
                </div>
              )}
              {material.semester && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Semestre:</span>
                  <span>{material.semester}</span>
                </div>
              )}
              {material.type && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Tipo:</span>
                  <span>{material.type}</span>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{material.downloadsCount} downloads</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Publicado{" "}
                  {formatDistanceToNow(new Date(material.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{formatBytes(material.size)}</span>
              </div>
              {material.uploadedBy && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Por: {material.uploadedBy.name || material.uploadedBy.email}
                  </span>
                </div>
              )}
            </div>

            {/* Botão de Download */}
            <div className="flex gap-4 pt-4 border-t">
              <Button asChild size="lg" className="flex-1">
                <Link href={`/material/download/${material.id}`}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Material
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/materiais">Voltar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

