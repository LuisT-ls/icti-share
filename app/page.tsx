import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MaterialList } from "@/components/MaterialList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Upload, Search } from "lucide-react";

export default async function Home() {
  const session = await getServerSession();

  // Buscar materiais em destaque (mais recentes ou mais baixados)
  const featuredMaterials = await prisma.material.findMany({
    take: 6,
    orderBy: [
      { downloadsCount: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              ICTI Share
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma de compartilhamento de materiais acadêmicos. 
              Acesse, compartilhe e aprenda juntos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/materiais">
                  <Search className="mr-2 h-4 w-4" />
                  Explorar Materiais
                </Link>
              </Button>
              {session ? (
                <Button asChild size="lg" variant="outline">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Material
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </section>

        {/* Featured Materials */}
        {featuredMaterials.length > 0 && (
          <section className="container mx-auto px-4 py-12 bg-muted/30">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <BookOpen className="h-8 w-8" />
                    Materiais em Destaque
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Os materiais mais populares da plataforma
                  </p>
                </div>
                <Button asChild variant="ghost">
                  <Link href="/materiais">
                    Ver todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <MaterialList materials={featuredMaterials} />
            </motion.div>
          </section>
        )}

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Busca Avançada</h3>
              <p className="text-muted-foreground">
                Encontre materiais por curso, disciplina, semestre e tipo
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Compartilhe</h3>
              <p className="text-muted-foreground">
                Faça upload de materiais e ajude outros estudantes
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Acesso Livre</h3>
              <p className="text-muted-foreground">
                Todos os materiais são de acesso público e gratuito
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
