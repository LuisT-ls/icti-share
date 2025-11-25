"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/app/actions/admin";
import { UserRole } from "@prisma/client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Shield } from "lucide-react";

interface UserRoleEditorProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  };
  currentUserId: string;
}

const roleLabels: Record<UserRole, string> = {
  VISITANTE: "Visitante",
  USUARIO: "Usuário",
  ADMIN: "Administrador",
};

export function UserRoleEditor({ user, currentUserId }: UserRoleEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (selectedRole === user.role) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await updateUserRole(user.id, selectedRole);
    setIsLoading(false);

    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Erro ao atualizar role do usuário");
    }
  };

  const isCurrentUser = user.id === currentUserId;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          {roleLabels[user.role]}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Role do Usuário</DialogTitle>
          <DialogDescription>
            Alterar role de {user.name || user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="role-select" className="block text-sm font-medium mb-2">
              Role
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isCurrentUser && selectedRole !== "ADMIN"}
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
            {isCurrentUser && selectedRole !== "ADMIN" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Você não pode remover seu próprio acesso de administrador
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20" role="alert">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setSelectedRole(user.role);
              setError(null);
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isLoading || (isCurrentUser && selectedRole !== "ADMIN")}
          >
            {isLoading ? "Atualizando..." : "Atualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

