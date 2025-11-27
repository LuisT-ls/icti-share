"use client";

import { useState } from "react";
import { PDFPreview } from "./PDFPreview";
import { PDFViewer } from "./PDFViewer";

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
      <PDFViewer
        materialId={materialId}
        title={title}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        downloadUrl={downloadUrl}
      />
    </>
  );
}
