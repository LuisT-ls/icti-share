"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-24">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 gradient-mesh -z-10 opacity-50" />

        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 max-w-2xl mx-auto"
          >
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="p-6 rounded-full bg-primary/10 mb-4"
            >
              <FileQuestion className="h-20 w-20 text-primary" />
            </motion.div>

            {/* Content */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Página não encontrada
              </h1>
              <p className="text-xl text-muted-foreground">
                Ops! Parece que o material ou página que você está procurando
                não existe ou foi movido.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Voltar para o Início
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2"
              >
                <Link href="/materiais">
                  <Search className="h-4 w-4" />
                  Explorar Materiais
                </Link>
              </Button>
            </div>

            {/* Interactive Element - Help Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-muted-foreground mt-8"
            >
              Precisa de ajuda?{" "}
              <Link
                href="mailto:contato@icti.br"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Entre em contato
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
