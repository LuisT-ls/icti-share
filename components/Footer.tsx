import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border-t bg-background"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ICTI Share. Todos os direitos reservados.</p>
          <p className="text-xs">
            Plataforma de compartilhamento de materiais acadêmicos
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

