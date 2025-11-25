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
import { AdminMaterialActions } from "@/components/AdminMaterialActions";
import { UserRoleEditor } from "@/components/UserRoleEditor";
import { motion } from "framer-motion";
import { Users, FileText, Download, Shield, Clock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MaterialStatus } from "@prisma/client";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Buscar todas as estatísticas e dados necessários
  const [
    totalMaterials,
    pendingMaterials,
    approvedMaterials,
    totalDownloads,
    totalUsers,
    adminCount,
    pendingMaterialsList,
    allUsers,
    topMaterials,
  ] = await Promise.all([
    prisma.material.count(),
    prisma.material.count({ where: { status: MaterialStatus.PENDING } }),
    prisma.material.count({ where: { status: MaterialStatus.APPROVED } }),
    prisma.download.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.material.findMany({
      where: { status: MaterialStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.user.findMany({
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
            downloads: true,
          },
        },
      },
    }),
    prisma.material.findMany({
      take: 10,
      orderBy: { downloadsCount: "desc" },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const adminPercentage = totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0;

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
                    <p className="text-2xl font-bold">{totalMaterials}</p>
                    <p className="text-sm text-muted-foreground">Total de Materiais</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {approvedMaterials} aprovados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{pendingMaterials}</p>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aguardando aprovação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Download className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{totalDownloads}</p>
                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Usuários</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {adminCount} administradores
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materiais Pendentes */}
          {pendingMaterialsList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Materiais Pendentes
                </CardTitle>
                <CardDescription>
                  {pendingMaterialsList.length} material(is) aguardando aprovação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Data de Upload</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMaterialsList.map((material) => (
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
                            {material.uploadedBy?.name || material.uploadedBy?.email || "N/A"}
                          </TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(material.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <AdminMaterialActions material={material} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 10 Downloads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top 10 Materiais Mais Baixados
              </CardTitle>
              <CardDescription>
                Materiais com maior número de downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMaterials.length > 0 ? (
                      topMaterials.map((material, index) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <a
                              href={`/material/${material.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {material.title}
                            </a>
                          </TableCell>
                          <TableCell>
                            {material.uploadedBy?.name || material.uploadedBy?.email || "N/A"}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {material.downloadsCount}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(material.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhum material encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Listagem de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Usuários
              </CardTitle>
              <CardDescription>
                Gerencie roles e permissões dos usuários
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
                      <TableHead>Downloads</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "Sem nome"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === "ADMIN"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : user.role === "USUARIO"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{user._count.uploadedMaterials}</TableCell>
                        <TableCell>{user._count.downloads}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <UserRoleEditor user={user} currentUserId={session.user.id} />
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
