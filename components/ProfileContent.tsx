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
import { User, Mail, Shield, Upload, Download } from "lucide-react";

interface ProfileContentProps {
  userName: string | null | undefined;
  userEmail: string;
  userRole: string;
  materialsCount: number;
  downloadsCount: number;
}

export function ProfileContent({
  userName,
  userEmail,
  userRole,
  materialsCount,
  downloadsCount,
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
    </motion.div>
  );
}
