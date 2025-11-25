"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveMaterial, rejectMaterial, removeMaterial } from "@/app/actions/admin";
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
import { Check, X, Trash2 } from "lucide-react";

interface AdminMaterialActionsProps {
  material: {
    id: string;
    title: string;
  };
}

export function AdminMaterialActions({ material }: AdminMaterialActionsProps) {
  const router = useRouter();
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    const result = await approveMaterial(material.id);
    setIsLoading(false);

    if (result.success) {
      setIsApproveOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Erro ao aprovar material");
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    setError(null);
    const result = await rejectMaterial(material.id);
    setIsLoading(false);

    if (result.success) {
      setIsRejectOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Erro ao rejeitar material");
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setError(null);
    const result = await removeMaterial(material.id);
    setIsLoading(false);

    if (result.success) {
      setIsRemoveOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Erro ao remover material");
    }
  };

  return (
    <div className="flex gap-2">
      {/* Aprovar */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Material</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar o material &quot;{material.title}&quot;?
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20" role="alert">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveOpen(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Aprovando..." : "Aprovar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejeitar */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
            <X className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Material</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja rejeitar o material &quot;{material.title}&quot;?
              O material será marcado como rejeitado, mas não será removido.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20" role="alert">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectOpen(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              {isLoading ? "Rejeitando..." : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remover */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Material</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover permanentemente o material &quot;{material.title}&quot;?
              Esta ação não pode ser desfeita e o arquivo será deletado do servidor.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20" role="alert">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveOpen(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

