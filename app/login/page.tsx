"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { useRouter } from "next/navigation";
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
        }
      } catch (error) {
        // Se houver redirect (NEXT_REDIRECT), o Next.js cuida automaticamente
        // Não precisamos fazer nada aqui
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
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="••••••••"
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
                </div>

                {serverError && (
                  <div
                    className="rounded-md bg-destructive/10 p-4 border border-destructive/20"
                    role="alert"
                  >
                    <p className="text-sm text-destructive">{serverError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:underline font-medium"
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
