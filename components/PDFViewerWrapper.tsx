"use client";

import { useState, lazy, Suspense } from "react";
import { PDFPreview } from "./PDFPreview";
import { Loader2 } from "lucide-react";

// Lazy load do PDFViewer (componente pesado)
const PDFViewer = lazy(() =>
  import("./PDFViewer").then((mod) => ({ default: mod.PDFViewer }))
);

interface PDFViewerWrapperProps {
  materialId: string;
  title: string;
  downloadUrl: string;
}

export function PDFViewerWrapper({
  materialId,
  title,
  downloadUrl,
}: PDFViewerWrapperProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview do PDF</h3>
        </div>
        <PDFPreview
          materialId={materialId}
          title={title}
          onViewFull={() => setIsViewerOpen(true)}
        />
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <PDFViewer
          materialId={materialId}
          title={title}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
          downloadUrl={downloadUrl}
        />
      </Suspense>
    </>
  );
}
