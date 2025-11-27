"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      try {
        const result = await login(formData);
        // Se houver erro, exibir mensagem
        if (result?.error) {
          setServerError(result.error);
          return;
        }
        // Se não houver erro, atualizar a sessão e redirecionar
        if (result?.success) {
          // Atualizar a sessão para refletir no nav imediatamente
          await update();
          // Redirecionar para a página desejada
          router.push(callbackUrl);
          // Forçar atualização da página para garantir que o nav seja atualizado
          router.refresh();
        } else if (!result?.error) {
          // Se não há erro nem sucesso explícito, ainda assim tentar atualizar e redirecionar
          // (caso o resultado seja undefined ou não tenha as propriedades esperadas)
          await update();
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (error) {
        // Outros erros
        console.error("Erro no login:", error);
        setServerError(
          error instanceof Error
            ? error.message
            : "Erro ao fazer login. Tente novamente."
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
                    className="h-6 w-6 text-accent-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Entrar</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Entre com suas credenciais para acessar a plataforma
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  size="lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 border-t border-border/50">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-accent-light transition-colors text-center"
              >
                Esqueceu sua senha?
              </Link>
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  href="/signup"
                  className="text-accent-light hover:underline font-semibold transition-colors"
                >
                  Cadastre-se
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Entrar</CardTitle>
                  <CardDescription>Carregando...</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
