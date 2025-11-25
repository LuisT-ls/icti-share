"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { FileText } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity"
          aria-label="ICTI Share - Página inicial"
        >
          <FileText className="h-5 w-5 text-primary" />
          <span>ICTI Share</span>
        </Link>

        <nav className="flex items-center" aria-label="Navegação principal">
          <UserMenu />
        </nav>
      </div>
    </motion.header>
  );
}
