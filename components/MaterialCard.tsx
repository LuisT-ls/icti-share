"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Calendar, User } from "lucide-react";
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
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-border/50 group overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
                <Link
                  href={`/material/${id}`}
                  className="hover:underline decoration-2 underline-offset-2"
                  aria-label={`Ver detalhes de ${title}`}
                >
                  {title}
                </Link>
              </CardTitle>
              {description && variant === "default" && (
                <CardDescription className="mt-2.5 line-clamp-2 text-sm leading-relaxed">
                  {description}
                </CardDescription>
              )}
            </div>
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors duration-200">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3">
          {metadata && (
            <div className="px-1">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {metadata}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
              <Download className="h-3.5 w-3.5" />
              <span className="font-medium">{downloadsCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          {uploadedBy && variant === "default" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">
                {uploadedBy.name || uploadedBy.email}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t border-border/50">
          <Button
            asChild
            variant="default"
            className="flex-1 font-medium transition-all duration-200 hover:scale-105"
          >
            <Link href={`/material/${id}`}>Ver Detalhes</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
