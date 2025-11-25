"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MaterialCardProps {
  id: string;
  title: string;
  description?: string | null;
  course?: string | null;
  discipline?: string | null;
  semester?: string | null;
  type?: string | null;
  downloadsCount: number;
  createdAt: Date;
  uploadedBy?: {
    name?: string | null;
    email: string;
  } | null;
  variant?: "default" | "compact";
}

export function MaterialCard({
  id,
  title,
  description,
  course,
  discipline,
  semester,
  type,
  downloadsCount,
  createdAt,
  uploadedBy,
  variant = "default",
}: MaterialCardProps) {
  const metadata = [
    course && `Curso: ${course}`,
    discipline && `Disciplina: ${discipline}`,
    semester && `Semestre: ${semester}`,
    type && `Tipo: ${type}`,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-2 text-lg">
                <Link
                  href={`/material/${id}`}
                  className="hover:text-primary transition-colors"
                  aria-label={`Ver detalhes de ${title}`}
                >
                  {title}
                </Link>
              </CardTitle>
              {description && variant === "default" && (
                <CardDescription className="mt-2 line-clamp-2">
                  {description}
                </CardDescription>
              )}
            </div>
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardHeader>

        <CardContent>
          {metadata && (
            <p className="text-sm text-muted-foreground mb-3">{metadata}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{downloadsCount} downloads</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
          {uploadedBy && variant === "default" && (
            <p className="text-xs text-muted-foreground mt-2">
              Por: {uploadedBy.name || uploadedBy.email}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/material/${id}`}>Ver Detalhes</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

