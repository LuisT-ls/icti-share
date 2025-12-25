"use client";

// import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Upload, Sparkles } from "lucide-react";

interface HeroSectionProps {
  hasSession: boolean;
}

export function HeroSection({ hasSession }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh -z-10" />

      <div className="container mx-auto px-4 py-20 md:py-32 lg:py-40">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-accent/50 text-sm font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plataforma Acadêmica</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-gradient">ICTI Share</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plataforma de compartilhamento de materiais acadêmicos.{" "}
            <span className="text-foreground font-medium">
              Acesse, compartilhe e aprenda juntos.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Link href="/materiais">
                <Search className="mr-2 h-5 w-5" />
                Explorar Materiais
              </Link>
            </Button>
            {hasSession ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-semibold border-2 hover:bg-accent transition-all duration-200 hover:scale-105"
              >
                <Link href="/upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Enviar Material
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-semibold border-2 hover:bg-accent transition-all duration-200 hover:scale-105"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
