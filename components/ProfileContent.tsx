"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditProfileForm } from "@/components/EditProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { MaterialActions } from "@/components/MaterialActions";
import { User, Mail, Shield, Upload, Download, FileText } from "lucide-react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  description: string | null;
  course: string | null;
  discipline: string | null;
  semester: string | null;
  type: string | null;
  downloadsCount: number;
  createdAt: Date;
}

interface ProfileContentProps {
  userName: string | null | undefined;
  userEmail: string;
  userRole: string;
  userCourse: string | null;
  materialsCount: number;
  downloadsCount: number;
  materials: Material[];
}

export function ProfileContent({
  userName,
  userEmail,
  userRole,
  userCourse,
  materialsCount,
  downloadsCount,
  materials,
}: ProfileContentProps) {
  return (
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
                <p className="text-sm font-medium text-muted-foreground">
                  Nome
                </p>
                <p className="text-lg">{userName || "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-lg">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Permissão
                </p>
                <p className="text-lg">{userRole}</p>
              </div>
            </div>
            {userCourse && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Curso
                  </p>
                  <p className="text-lg">{userCourse}</p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{materialsCount}</p>
                <p className="text-sm text-muted-foreground">
                  Materiais enviados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Download className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{downloadsCount}</p>
                <p className="text-sm text-muted-foreground">
                  Downloads realizados
                </p>
              </div>
            </div>
          </div>

          {/* Formulário de edição */}
          <div className="pt-4 border-t">
            <EditProfileForm defaultName={userName || ""} />
          </div>
        </CardContent>
      </Card>

      {/* Seção de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie as configurações de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Seção de Materiais Enviados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Meus Documentos
          </CardTitle>
          <CardDescription>
            Documentos que você enviou para a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Você ainda não enviou nenhum documento.
              </p>
              <Link
                href="/upload"
                className="text-primary hover:underline font-medium inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Fazer primeiro upload
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2">
                        <Link
                          href={`/material/${material.id}`}
                          className="hover:text-accent-light transition-colors"
                        >
                          {material.title}
                        </Link>
                      </h3>
                      {material.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {material.course && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Curso:</span>
                            {material.course}
                          </span>
                        )}
                        {material.discipline && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Disciplina:</span>
                            {material.discipline}
                          </span>
                        )}
                        {material.semester && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Semestre:</span>
                            {material.semester}
                          </span>
                        )}
                        {material.type && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Tipo:</span>
                            {material.type}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {material.downloadsCount} downloads
                        </span>
                        <span>
                          {new Date(material.createdAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <MaterialActions material={material} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
