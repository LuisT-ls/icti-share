"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Upload } from "lucide-react";

interface HeroSectionProps {
  hasSession: boolean;
}

export function HeroSection({ hasSession }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          ICTI Share
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plataforma de compartilhamento de materiais acadêmicos. Acesse,
          compartilhe e aprenda juntos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/materiais">
              <Search className="mr-2 h-4 w-4" />
              Explorar Materiais
            </Link>
          </Button>
          {hasSession ? (
            <Button asChild size="lg" variant="outline">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Enviar Material
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
