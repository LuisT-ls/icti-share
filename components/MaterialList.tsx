"use client";

import { MaterialCard } from "./MaterialCard";
import { motion } from "framer-motion";

interface Material {
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
}

interface MaterialListProps {
  materials: Material[];
  variant?: "default" | "compact";
}

export function MaterialList({
  materials,
  variant = "default",
}: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground">Nenhum material encontrado.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material, index) => (
        <motion.div
          key={material.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
        >
          <MaterialCard {...material} variant={variant} />
        </motion.div>
      ))}
    </div>
  );
}
