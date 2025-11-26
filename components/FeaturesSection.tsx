"use client";

import { motion } from "framer-motion";
import { Search, Upload, BookOpen } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-3 gap-8 md:gap-12"
      >
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="text-center space-y-5 p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
        >
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Search className="h-7 w-7 text-accent-light" />
          </div>
          <h3 className="text-xl font-bold">Busca Avançada</h3>
          <p className="text-muted-foreground leading-relaxed">
            Encontre materiais por curso, disciplina, semestre e tipo
          </p>
        </motion.div>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="text-center space-y-5 p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
        >
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Upload className="h-7 w-7 text-accent-light" />
          </div>
          <h3 className="text-xl font-bold">Compartilhe</h3>
          <p className="text-muted-foreground leading-relaxed">
            Faça upload de materiais e ajude outros estudantes
          </p>
        </motion.div>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="text-center space-y-5 p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
        >
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-7 w-7 text-accent-light" />
          </div>
          <h3 className="text-xl font-bold">Acesso Livre</h3>
          <p className="text-muted-foreground leading-relaxed">
            Todos os materiais são de acesso público e gratuito
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
