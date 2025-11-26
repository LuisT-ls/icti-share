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
    course &&
    course !== "";

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
    allFieldsFilled && passwordMeetsRequirements && courseIsValid && isValid;

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
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh opacity-50 -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    Criar conta
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Preencha os dados para criar sua conta
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Nome <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Seu nome"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    aria-required="true"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      <span className="text-destructive">•</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="seu@email.com"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    aria-required="true"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      <span className="text-destructive">•</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Senha <span className="text-destructive">*</span>
                  </label>
                  <PasswordInput
                    id="password"
                    {...register("password")}
                    placeholder="Digite sua senha"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    aria-required="true"
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      <span className="text-destructive">•</span>
                      {errors.password.message}
                    </p>
                  )}
                  <PasswordStrengthIndicator password={password || ""} />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="course"
                    className="block text-sm font-semibold text-foreground"
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
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      <span className="text-destructive">•</span>
                      {errors.course.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-destructive/10 p-4 border border-destructive/20"
                    role="alert"
                  >
                    <p className="text-sm text-destructive font-medium">
                      {serverError}
                    </p>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800"
                    role="alert"
                  >
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                      {successMessage}
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isPending || !isFormValid}
                  className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-semibold transition-colors"
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
