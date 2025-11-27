"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as pdfjsLib from "pdfjs-dist";

// Configurar worker do pdf.js usando arquivo local
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PDFViewerProps {
  materialId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadUrl: string;
}

export function PDFViewer({
  materialId,
  title,
  open,
  onOpenChange,
  downloadUrl,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        setPageNumber(1);

        const pdfUrl = `/api/material/preview/${materialId}`;

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
        });

        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        await renderPage(pdf, 1);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar PDF:", err);
        if (isMounted) {
          setError("Erro ao carregar PDF. Tente fazer o download.");
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [materialId, open]);

  const renderPage = async (
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNum: number
  ) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({
        scale: scale,
        rotation: rotation,
      });

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
    } catch (err) {
      console.error("Erro ao renderizar página:", err);
      setError("Erro ao renderizar página");
    }
  };

  useEffect(() => {
    if (pdfRef.current && !loading) {
      renderPage(pdfRef.current, pageNumber);
    }
  }, [pageNumber, scale, rotation, loading]);

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pdfRef.current && pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Visualizador de PDF com controles de navegação, zoom e rotação
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={downloadUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Controles */}
        <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between gap-4 flex-shrink-0 bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {loading ? "..." : `${pageNumber} / ${totalPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!pdfRef.current || pageNumber >= totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={loading}
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={loading}
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              disabled={loading}
              title="Rotacionar"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas do PDF */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Carregando PDF...
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-destructive mb-4">{error}</p>
                <Button variant="outline" asChild>
                  <a href={downloadUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </a>
                </Button>
              </div>
            </div>
          )}
          {!loading && !error && (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="shadow-lg border border-border/50 bg-white"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
