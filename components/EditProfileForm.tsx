"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

interface EditProfileFormProps {
  defaultName: string;
}

export function EditProfileForm({ defaultName }: EditProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 2000);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nome
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName}
          required
          minLength={2}
          aria-required="true"
        />
      </div>
      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200" role="alert">
          <p className="text-sm text-green-800">Perfil atualizado com sucesso!</p>
        </div>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}

