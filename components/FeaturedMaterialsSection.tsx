"use client";

import { motion } from "framer-motion";
import { MaterialList } from "@/components/MaterialList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

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

interface FeaturedMaterialsSectionProps {
  materials: Material[];
}

export function FeaturedMaterialsSection({
  materials,
}: FeaturedMaterialsSectionProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Materiais em Destaque
            </h2>
            <p className="text-muted-foreground mt-2">
              Os materiais mais populares da plataforma
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/materiais">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <MaterialList materials={materials} />
      </motion.div>
    </section>
  );
}
