"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import {
  signupSchema,
  type SignupFormData,
  COURSE_OPTIONS,
} from "@/lib/validations/schemas";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched", // Validar apenas após o campo ser tocado
    reValidateMode: "onChange", // Revalidar em tempo real após primeira validação
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const course = watch("course");
  const name = watch("name");
  const email = watch("email");

  // Verificar se todos os campos obrigatórios estão preenchidos
  const allFieldsFilled =
    name &&
    name.length >= 2 &&
    email &&
    password &&
    password.length >= 8 &&
    confirmPassword &&
    course &&
    course !== "";

  // Verificar se as senhas coincidem
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  // Verificar se a senha atende aos requisitos
  const passwordMeetsRequirements =
    password &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  // Verificar se o curso é válido
  const courseIsValid =
    course &&
    COURSE_OPTIONS.includes(course as (typeof COURSE_OPTIONS)[number]);

  // Formulário válido quando todos os critérios são atendidos
  const isFormValid =
    allFieldsFilled &&
    passwordsMatch &&
    passwordMeetsRequirements &&
    courseIsValid &&
    isValid;

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("course", data.course);

      try {
        const result = await signup(formData);

        if (result?.error) {
          setServerError(result.error);
          setSuccessMessage(null);
        } else if (result?.success) {
          // Se houver mensagem de sucesso, mostrar brevemente antes de redirecionar
          if (result.message) {
            setServerError(null);
            setSuccessMessage(result.message);
            // Mostrar mensagem de sucesso por 2 segundos antes de redirecionar
            setTimeout(() => {
              router.push("/login");
              router.refresh();
            }, 2000);
          } else {
            // Se não houver mensagem, redirecionar imediatamente (login automático funcionou)
            router.push("/");
            router.refresh();
          }
        }
      } catch (error) {
        // Se houver redirect (NEXT_REDIRECT), o Next.js cuida automaticamente
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
          // Cadastro bem-sucedido, redirecionamento em andamento
          return;
        }
        // Outros erros
        console.error("Erro no signup:", error);
        setServerError(
          error instanceof Error
            ? error.message
            : "Erro ao criar conta. Tente novamente."
        );
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Criar conta</CardTitle>
              <CardDescription>
                Preencha os dados para criar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Nome <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Seu nome"
                    aria-required="true"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="mt-1 text-sm text-destructive"
                      role="alert"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="seu@email.com"
                    aria-required="true"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1 text-sm text-destructive"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    Senha <span className="text-destructive">*</span>
                  </label>
                  <PasswordInput
                    id="password"
                    {...register("password")}
                    placeholder="Digite sua senha"
                    aria-required="true"
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1 text-sm text-destructive"
                      role="alert"
                    >
                      {errors.password.message}
                    </p>
                  )}
                  <PasswordStrengthIndicator password={password || ""} />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2"
                  >
                    Confirmar Senha <span className="text-destructive">*</span>
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    placeholder="Digite a senha novamente"
                    aria-required="true"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
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

                <div>
                  <label
                    htmlFor="course"
                    className="block text-sm font-medium mb-2"
                  >
                    Curso <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="course"
                    {...register("course", {
                      required: "Selecione um curso",
                      validate: (value) => {
                        if (!value || value === "") {
                          return "Selecione um curso";
                        }
                        if (
                          !COURSE_OPTIONS.includes(
                            value as (typeof COURSE_OPTIONS)[number]
                          )
                        ) {
                          return "Selecione um curso válido";
                        }
                        return true;
                      },
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-required="true"
                    aria-invalid={errors.course ? "true" : "false"}
                    aria-describedby={
                      errors.course ? "course-error" : undefined
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione um curso
                    </option>
                    {COURSE_OPTIONS.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <p
                      id="course-error"
                      className="mt-1 text-sm text-destructive"
                      role="alert"
                    >
                      {errors.course.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <div
                    className="rounded-md bg-destructive/10 p-4 border border-destructive/20"
                    role="alert"
                  >
                    <p className="text-sm text-destructive">{serverError}</p>
                  </div>
                )}

                {successMessage && (
                  <div
                    className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800"
                    role="alert"
                  >
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {successMessage}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending || !isFormValid}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
