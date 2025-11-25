"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { editMaterialSchema, type EditMaterialFormData } from "@/lib/validations/schemas";

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
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditMaterialFormData>({
    resolver: zodResolver(editMaterialSchema),
    defaultValues: {
      title: material.title,
      description: material.description || "",
      course: material.course || "",
      discipline: material.discipline || "",
      semester: material.semester || "",
      type: material.type || "",
    },
  });

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

  const onSubmit = async (data: EditMaterialFormData) => {
    setServerError(null);

    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description && data.description.trim()) {
      formData.append("description", data.description);
    }
    if (data.course && data.course.trim()) {
      formData.append("course", data.course);
    }
    if (data.discipline && data.discipline.trim()) {
      formData.append("discipline", data.discipline);
    }
    if (data.semester && data.semester.trim()) {
      formData.append("semester", data.semester);
    }
    if (data.type && data.type.trim()) {
      formData.append("type", data.type);
    }

    const result = await updateMaterial(material.id, formData);

    if (result.success) {
      setIsEditOpen(false);
      reset();
      router.refresh();
    } else {
      setServerError(result.error);
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Editar Material</DialogTitle>
              <DialogDescription>
                Atualize as informações do material
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                  Título <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-title"
                  {...register("title")}
                  aria-required="true"
                  aria-invalid={errors.title ? "true" : "false"}
                  aria-describedby={errors.title ? "edit-title-error" : undefined}
                />
                {errors.title && (
                  <p id="edit-title-error" className="mt-1 text-sm text-destructive" role="alert">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  id="edit-description"
                  {...register("description")}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                  aria-invalid={errors.description ? "true" : "false"}
                  aria-describedby={errors.description ? "edit-description-error" : undefined}
                />
                {errors.description && (
                  <p id="edit-description-error" className="mt-1 text-sm text-destructive" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-course" className="block text-sm font-medium mb-2">
                    Curso
                  </label>
                  <Input
                    id="edit-course"
                    {...register("course")}
                    aria-invalid={errors.course ? "true" : "false"}
                    aria-describedby={errors.course ? "edit-course-error" : undefined}
                  />
                  {errors.course && (
                    <p id="edit-course-error" className="mt-1 text-sm text-destructive" role="alert">
                      {errors.course.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="edit-discipline" className="block text-sm font-medium mb-2">
                    Disciplina
                  </label>
                  <Input
                    id="edit-discipline"
                    {...register("discipline")}
                    aria-invalid={errors.discipline ? "true" : "false"}
                    aria-describedby={errors.discipline ? "edit-discipline-error" : undefined}
                  />
                  {errors.discipline && (
                    <p id="edit-discipline-error" className="mt-1 text-sm text-destructive" role="alert">
                      {errors.discipline.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="edit-semester" className="block text-sm font-medium mb-2">
                    Semestre
                  </label>
                  <Input
                    id="edit-semester"
                    {...register("semester")}
                    aria-invalid={errors.semester ? "true" : "false"}
                    aria-describedby={errors.semester ? "edit-semester-error" : undefined}
                  />
                  {errors.semester && (
                    <p id="edit-semester-error" className="mt-1 text-sm text-destructive" role="alert">
                      {errors.semester.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="edit-type" className="block text-sm font-medium mb-2">
                    Tipo
                  </label>
                  <Input
                    id="edit-type"
                    {...register("type")}
                    aria-invalid={errors.type ? "true" : "false"}
                    aria-describedby={errors.type ? "edit-type-error" : undefined}
                  />
                  {errors.type && (
                    <p id="edit-type-error" className="mt-1 text-sm text-destructive" role="alert">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              {serverError && (
                <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20" role="alert">
                  <p className="text-sm text-destructive">{serverError}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  reset();
                  setServerError(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
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

