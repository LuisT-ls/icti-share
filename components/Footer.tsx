"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border-t border-border/50 bg-muted/30 mt-auto"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">ICTI Share</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma de compartilhamento de materiais acadêmicos. Acesse,
              compartilhe e aprenda juntos.
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Links Rápidos</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/materiais"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Materiais
              </Link>
              <Link
                href="/upload"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Enviar Material
              </Link>
            </nav>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a
                href="mailto:contato@icti.edu.br"
                className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
              >
                <Mail className="h-4 w-4" />
                <span>contato@icti.br</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} ICTI Share. Todos os direitos
              reservados.
            </p>
            <p className="text-xs">
              Desenvolvido com ❤️ para a comunidade acadêmica - ICTI - Camaçari
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
