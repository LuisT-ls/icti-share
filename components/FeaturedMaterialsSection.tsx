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
    <section className="container mx-auto px-4 py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-accent-light" />
              </div>
              <span className="text-gradient">Materiais em Destaque</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Os materiais mais populares da plataforma
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-2 hover:bg-accent transition-all duration-200 hover:scale-105"
          >
            <Link href="/materiais" className="flex items-center gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <MaterialList materials={materials} />
      </motion.div>
    </section>
  );
}
