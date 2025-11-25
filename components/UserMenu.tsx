"use client";

import { useSession } from "next-auth/react";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Cadastrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {session.user.name || session.user.email}
      </span>
      {session.user.role === "ADMIN" && (
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button asChild variant="ghost" size="sm">
        <Link href="/perfil">Perfil</Link>
      </Button>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>
    </motion.div>
  );
}

