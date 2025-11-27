"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/app/actions/auth";
import { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/schemas";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
    },
  });

  // Observar mudanças na senha para o indicador de força
  const watchedPassword = watch("password");
  useEffect(() => {
    setPassword(watchedPassword || "");
  }, [watchedPassword]);

  // Verificar se há token
  useEffect(() => {
    if (!token) {
      setServerMessage({
        type: "error",
        message: "Token inválido. Solicite um novo link de recuperação.",
      });
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerMessage(null);

    if (!token) {
      setServerMessage({
        type: "error",
        message: "Token inválido. Solicite um novo link de recuperação.",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      try {
        const result = await resetPassword(formData);

        if (result?.error) {
          setServerMessage({
            type: "error",
            message: result.error,
          });
          return;
        }

        if (result?.success) {
          setServerMessage({
            type: "success",
            message:
              result.message ||
              "Senha redefinida com sucesso! Redirecionando...",
          });

          // Redirecionar para login após 2 segundos
          setTimeout(() => {
            router.push("/login?message=Senha redefinida com sucesso!");
          }, 2000);
        }
      } catch (error) {
        console.error("Erro ao resetar senha:", error);
        setServerMessage({
          type: "error",
          message: "Erro ao redefinir senha. Tente novamente.",
        });
      }
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Token Inválido</CardTitle>
              <CardDescription>
                O link de recuperação é inválido ou expirou.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/forgot-password">
                <Button>Solicitar Novo Link</Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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
                  <Lock className="h-6 w-6 text-accent-light" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    Redefinir Senha
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Digite sua nova senha
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input type="hidden" {...register("token")} value={token} />

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Nova Senha <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="••••••••"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    aria-required="true"
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  {password && (
                    <PasswordStrengthIndicator password={password} />
                  )}
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
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Confirmar Senha <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                      className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      <span className="text-destructive">•</span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {serverMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-4 border flex items-start gap-3 ${
                      serverMessage.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-destructive/10 border-destructive/20"
                    }`}
                    role="alert"
                  >
                    {serverMessage.type === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={`text-sm font-medium flex-1 ${
                        serverMessage.type === "success"
                          ? "text-green-800 dark:text-green-200"
                          : "text-destructive"
                      }`}
                    >
                      {serverMessage.message}
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isPending || !!serverMessage?.type}
                  className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  size="lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Redefinindo...
                    </span>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 border-t border-border/50">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-accent-light transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Carregando...</CardTitle>
                <CardDescription>
                  Aguarde enquanto carregamos a página.
                </CardDescription>
              </CardHeader>
            </Card>
          </main>
          <Footer />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
