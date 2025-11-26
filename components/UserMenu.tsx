"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, LogOut, Settings, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Entrar</span>
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Cadastrar</Link>
        </Button>
      </div>
    );
  }

  const userName = session.user.name || session.user.email;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3"
    >
      {/* Link para Materiais - sempre visível */}
      <Link href="/materiais">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          <span>Materiais</span>
        </Button>
      </Link>

      {/* Botão Admin - apenas para admins */}
      {session.user.role === "ADMIN" && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2"
        >
          <Link href="/admin">
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </Button>
      )}

      {/* Menu Dropdown do Usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full sm:h-auto sm:w-auto sm:px-3 sm:py-2 sm:rounded-md"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                {userName}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name || "Usuário"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          {session.user.role === "ADMIN" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex items-center cursor-pointer"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Painel Admin</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={async (e) => {
              e.preventDefault();
              // Usar signOut do next-auth/react diretamente no cliente com redirect automático
              // Isso garante que a sessão seja atualizada e a página seja redirecionada corretamente
              await signOut({
                redirect: true,
                callbackUrl: "/",
              });
            }}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
