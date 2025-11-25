"use client";

import { motion } from "framer-motion";
import { Search, Upload, BookOpen } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-3 gap-8"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Busca Avançada</h3>
          <p className="text-muted-foreground">
            Encontre materiais por curso, disciplina, semestre e tipo
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Compartilhe</h3>
          <p className="text-muted-foreground">
            Faça upload de materiais e ajude outros estudantes
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Acesso Livre</h3>
          <p className="text-muted-foreground">
            Todos os materiais são de acesso público e gratuito
          </p>
        </div>
      </motion.div>
    </section>
  );
}
