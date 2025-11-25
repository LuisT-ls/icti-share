"use client";

import { useState } from "react";
import { deleteMaterial, updateMaterial } from "@/app/actions/materials";
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
import { Input } from "./ui/input";
import { Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface MaterialActionsProps {
  material: {
    id: string;
    title: string;
    description?: string | null;
    course?: string | null;
    discipline?: string | null;
    semester?: string | null;
    type?: string | null;
  };
}

export function MaterialActions({ material }: MaterialActionsProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteMaterial(material.id);
    setIsDeleting(false);
    if (result.success) {
      setIsDeleteOpen(false);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const handleEdit = async (formData: FormData) => {
    setIsEditing(true);
    const result = await updateMaterial(material.id, {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      course: formData.get("course") as string,
      discipline: formData.get("discipline") as string,
      semester: formData.get("semester") as string,
      type: formData.get("type") as string,
    });
    setIsEditing(false);
    if (result.success) {
      setIsEditOpen(false);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar Material</DialogTitle>
              <DialogDescription>
                Atualize as informações do material
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                  Título
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={material.title}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={material.description || ""}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-course" className="block text-sm font-medium mb-2">
                    Curso
                  </label>
                  <Input
                    id="edit-course"
                    name="course"
                    defaultValue={material.course || ""}
                  />
                </div>
                <div>
                  <label htmlFor="edit-discipline" className="block text-sm font-medium mb-2">
                    Disciplina
                  </label>
                  <Input
                    id="edit-discipline"
                    name="discipline"
                    defaultValue={material.discipline || ""}
                  />
                </div>
                <div>
                  <label htmlFor="edit-semester" className="block text-sm font-medium mb-2">
                    Semestre
                  </label>
                  <Input
                    id="edit-semester"
                    name="semester"
                    defaultValue={material.semester || ""}
                  />
                </div>
                <div>
                  <label htmlFor="edit-type" className="block text-sm font-medium mb-2">
                    Tipo
                  </label>
                  <Input
                    id="edit-type"
                    name="type"
                    defaultValue={material.type || ""}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o material &quot;{material.title}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

