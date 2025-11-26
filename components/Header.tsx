"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { FileText } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center space-x-2.5 text-xl font-bold transition-all duration-200 hover:opacity-80"
          aria-label="ICTI Share - Página inicial"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <FileText className="relative h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            ICTI Share
          </span>
        </Link>

        <nav
          className="flex items-center gap-2"
          aria-label="Navegação principal"
        >
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </motion.header>
  );
}
