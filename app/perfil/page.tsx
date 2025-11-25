import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileForm } from "@/components/EditProfileForm";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Upload, Download } from "lucide-react";

export default async function PerfilPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Buscar estatísticas do usuário
  const [materialsCount, downloadsCount] = await Promise.all([
    prisma.material.count({
      where: { uploadedById: session.user.id },
    }),
    prisma.download.count({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Meu Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e visualize suas estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações do usuário */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-lg">{session.user.name || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Permissão</p>
                    <p className="text-lg">{session.user.role}</p>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Upload className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{materialsCount}</p>
                    <p className="text-sm text-muted-foreground">Materiais enviados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Download className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{downloadsCount}</p>
                    <p className="text-sm text-muted-foreground">Downloads realizados</p>
                  </div>
                </div>
              </div>

              {/* Formulário de edição */}
              <div className="pt-4 border-t">
                <EditProfileForm defaultName={session.user.name || ""} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
