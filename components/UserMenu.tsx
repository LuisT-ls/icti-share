"use client";

import { useSession } from "next-auth/react";
import { logout } from "@/app/actions/auth";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-4">
        <a
          href="/login"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Entrar
        </a>
        <a
          href="/signup"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Cadastrar
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">
        {session.user.name || session.user.email}
      </span>
      <span className="text-xs text-gray-500">({session.user.role})</span>
      <a
        href="/perfil"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Perfil
      </a>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Sair
        </button>
      </form>
    </div>
  );
}

