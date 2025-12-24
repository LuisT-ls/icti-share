"use client";

import { useState, useTransition } from "react";
import { Plus, Check, Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCollection,
  addToCollection,
  getUserCollections,
} from "@/app/actions/collections";
import { useSession } from "next-auth/react";

interface Collection {
  id: string;
  title: string;
  _count: { items: number };
}

interface AddToCollectionDialogProps {
  materialId: string;
  trigger?: React.ReactNode;
}

export function AddToCollectionDialog({
  materialId,
  trigger,
}: AddToCollectionDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"select" | "create">("select");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Carregar coleções ao abrir
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && session?.user) {
      setIsLoadingCollections(true);
      getUserCollections()
        .then((data) => {
          setCollections(data);
          if (data.length === 0) {
            setMode("create");
          }
        })
        .finally(() => setIsLoadingCollections(false));
    }
  };

  const handleCreateAndAdd = () => {
    if (!newCollectionTitle.trim()) {
      toast.error("O título da coleção é obrigatório");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", newCollectionTitle);
      formData.append("isPublic", "true"); // Padrão público

      const result = await createCollection(formData);

      if (result.success && result.collection) {
        // Coleção criada, agora adicionar o material
        const addResult = await addToCollection(
          result.collection.id,
          materialId
        );

        if (addResult.success) {
          toast.success("Coleção criada e material adicionado!");
          setOpen(false);
          setMode("select");
          setNewCollectionTitle("");
        } else {
          toast.error(
            addResult.error || "Erro ao adicionar material à nova coleção"
          );
        }
      } else {
        toast.error(result.error || "Erro ao criar coleção");
      }
    });
  };

  const handleAddToExisting = () => {
    if (!selectedCollectionId) {
      toast.error("Selecione uma coleção");
      return;
    }

    startTransition(async () => {
      const result = await addToCollection(selectedCollectionId, materialId);
      if (result.success) {
        toast.success("Material adicionado à coleção!");
        setOpen(false);
      } else {
        toast.error(result.error || "Erro ao adicionar à coleção");
      }
    });
  };

  if (!session) {
    return null; // Ou um botão que redireciona para login
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FolderPlus className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar à Coleção</DialogTitle>
          <DialogDescription>
            Salve este material em uma coleção para acessar facilmente depois.
          </DialogDescription>
        </DialogHeader>

        {mode === "select" ? (
          <div className="grid gap-4 py-4">
            {isLoadingCollections ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collection">Selecione uma coleção</Label>
                  <Select
                    value={selectedCollectionId}
                    onValueChange={setSelectedCollectionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.title} ({collection._count.items} itens)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="link"
                  className="px-0 h-auto text-sm"
                  onClick={() => setMode("create")}
                >
                  + Criar nova coleção
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você ainda não tem coleções.
                </p>
                <Button onClick={() => setMode("create")}>
                  Criar minha primeira coleção
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome da Coleção</Label>
              <Input
                id="title"
                value={newCollectionTitle}
                onChange={(e) => setNewCollectionTitle(e.target.value)}
                placeholder="Ex: Estudos de Física, Provas Antigas..."
              />
            </div>
            {collections.length > 0 && (
              <Button
                variant="link"
                className="px-0 h-auto text-sm justify-start"
                onClick={() => setMode("select")}
              >
                Voltar para lista
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          {mode === "select" && collections.length > 0 ? (
            <Button onClick={handleAddToExisting} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          ) : mode === "create" ? (
            <Button onClick={handleCreateAndAdd} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar e Salvar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
