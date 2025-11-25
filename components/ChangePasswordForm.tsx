"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "@/app/actions/profile";
import { Button } from "./ui/button";
import { PasswordInput } from "./ui/password-input";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { useRouter } from "next/navigation";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/validations/schemas";
import { Lock } from "lucide-react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    setServerError(null);

    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await updatePassword(formData);

    if (result.success) {
      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 3000);
    } else {
      setServerError(result.error ?? null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Alterar Senha</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Para sua segurança, você precisa informar sua senha atual para alterar
          para uma nova senha.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium mb-2"
            >
              Senha Atual <span className="text-destructive">*</span>
            </label>
            <PasswordInput
              id="currentPassword"
              {...register("currentPassword")}
              placeholder="Digite sua senha atual"
              aria-required="true"
              aria-invalid={errors.currentPassword ? "true" : "false"}
              aria-describedby={
                errors.currentPassword ? "currentPassword-error" : undefined
              }
            />
            {errors.currentPassword && (
              <p
                id="currentPassword-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-2"
            >
              Nova Senha <span className="text-destructive">*</span>
            </label>
            <PasswordInput
              id="newPassword"
              {...register("newPassword")}
              placeholder="Digite sua nova senha"
              aria-required="true"
              aria-invalid={errors.newPassword ? "true" : "false"}
              aria-describedby={
                errors.newPassword ? "newPassword-error" : undefined
              }
            />
            {errors.newPassword && (
              <p
                id="newPassword-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.newPassword.message}
              </p>
            )}
            <PasswordStrengthIndicator password={newPassword || ""} />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirmar Nova Senha <span className="text-destructive">*</span>
            </label>
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
              placeholder="Digite a nova senha novamente"
              aria-required="true"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {serverError && (
        <div
          className="rounded-md bg-destructive/10 p-4 border border-destructive/20"
          role="alert"
        >
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {success && (
        <div
          className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800"
          role="alert"
        >
          <p className="text-sm text-green-800 dark:text-green-200">
            Senha alterada com sucesso!
          </p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Alterando..." : "Alterar Senha"}
      </Button>
    </form>
  );
}
