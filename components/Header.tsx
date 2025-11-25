"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { Button } from "./ui/button";

export function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xl font-bold"
          aria-label="ICTI Share - Página inicial"
        >
          <span>ICTI Share</span>
        </Link>

        <nav className="flex items-center gap-4" aria-label="Navegação principal">
          <Link href="/materiais">
            <Button variant="ghost" size="sm">
              Materiais
            </Button>
          </Link>
          <UserMenu />
        </nav>
      </div>
    </motion.header>
  );
}

