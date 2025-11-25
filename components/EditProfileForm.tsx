"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { editProfileSchema, type EditProfileFormData } from "@/lib/validations/schemas";

interface EditProfileFormProps {
  defaultName: string;
}

export function EditProfileForm({ defaultName }: EditProfileFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setServerError(null);

    const formData = new FormData();
    formData.append("name", data.name);

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nome <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          type="text"
          {...register("name")}
          aria-required="true"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20" role="alert">
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200" role="alert">
          <p className="text-sm text-green-800">Perfil atualizado com sucesso!</p>
        </div>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}

