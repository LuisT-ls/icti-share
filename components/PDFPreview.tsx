"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";

// Configurar worker do pdf.js usando arquivo local
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PDFPreviewProps {
  materialId: string;
  title: string;
  className?: string;
  onViewFull?: () => void;
}

export function PDFPreview({
  materialId,
  title,
  className,
  onViewFull,
}: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdfUrl = `/api/material/preview/${materialId}`;

        // 1. Validar resposta antes de passar para o pdf.js
        const response = await fetch(pdfUrl, { method: "HEAD" });
        if (!response.ok) {
          if (response.status === 404)
            throw new Error("Arquivo PDF não encontrado");
          throw new Error(`Erro ao verificar PDF: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/pdf")) {
          throw new Error("O arquivo retornado não é um PDF válido");
        }

        // Carregar PDF
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
        });

        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        // Renderizar primeira página
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        setPageNumber(1);
        setLoading(false);
      } catch (err: any) {
        console.error("Erro ao carregar PDF:", err);
        if (isMounted) {
          setError(err.message || "Erro ao carregar preview do PDF");
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [materialId]);

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 border border-border/50 rounded-lg bg-muted/30",
          className
        )}
      >
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground text-center mb-4">
          {error}
        </p>
        {onViewFull && (
          <Button variant="outline" size="sm" onClick={onViewFull}>
            Tentar Visualizar Completo
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Carregando preview...
            </p>
          </div>
        </div>
      )}
      <div className="relative border border-border/50 rounded-lg overflow-hidden bg-muted/20">
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-auto max-h-[600px] object-contain",
            loading && "opacity-0"
          )}
        />
        {!loading && onViewFull && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-200 group">
            <Button
              onClick={onViewFull}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              size="lg"
            >
              Visualizar PDF Completo
            </Button>
          </div>
        )}
      </div>
      {!loading && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Preview da primeira página • {title}
        </p>
      )}
    </div>
  );
}
