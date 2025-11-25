import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaterialActions } from "@/components/MaterialActions";
import { motion } from "framer-motion";
import { Users, FileText, Download, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Buscar estatísticas
  const [
    materialsCount,
    usersCount,
    downloadsCount,
    adminCount,
    recentMaterials,
    recentUsers,
  ] = await Promise.all([
    prisma.material.count(),
    prisma.user.count(),
    prisma.download.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.material.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            uploadedMaterials: true,
          },
        },
      },
    }),
  ]);

  const adminPercentage = usersCount > 0 ? Math.round((adminCount / usersCount) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie materiais, usuários e modere a plataforma
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{materialsCount}</p>
                    <p className="text-sm text-muted-foreground">Materiais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{usersCount}</p>
                    <p className="text-sm text-muted-foreground">Usuários</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Download className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{downloadsCount}</p>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{adminPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materiais Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais Recentes</CardTitle>
              <CardDescription>
                Últimos materiais enviados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <a
                            href={`/material/${material.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {material.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          {material.uploadedBy?.name || material.uploadedBy?.email}
                        </TableCell>
                        <TableCell>{material.downloadsCount}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(material.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <MaterialActions material={material} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Usuários Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Recentes</CardTitle>
              <CardDescription>
                Últimos usuários cadastrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Materiais</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "Sem nome"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.role === "ADMIN"
                                ? "bg-red-100 text-red-800"
                                : user.role === "USUARIO"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{user._count.uploadedMaterials}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
