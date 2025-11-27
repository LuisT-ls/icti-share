"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/app/actions/auth";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/schemas";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);

      try {
        const result = await requestPasswordReset(formData);

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
              "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
          });
        }
      } catch (error) {
        console.error("Erro ao solicitar recuperação:", error);
        setServerMessage({
          type: "error",
          message: "Erro ao solicitar recuperação. Tente novamente.",
        });
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
                  <Mail className="h-6 w-6 text-accent-light" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    Recuperar Senha
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Digite seu email para receber um link de recuperação
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

                {serverMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-4 border ${
                      serverMessage.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-destructive/10 border-destructive/20"
                    }`}
                    role="alert"
                  >
                    <p
                      className={`text-sm font-medium ${
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
                  disabled={isPending}
                  className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  size="lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar Link de Recuperação"
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
