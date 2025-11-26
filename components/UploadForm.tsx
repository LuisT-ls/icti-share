"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { uploadMaterial } from "@/app/actions/upload";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Upload, FileText } from "lucide-react";
import {
  uploadMaterialSchema,
  type UploadMaterialFormData,
} from "@/lib/validations/schemas";

export function UploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    getValues,
  } = useForm<UploadMaterialFormData>({
    resolver: zodResolver(uploadMaterialSchema),
  });

  const selectedFile = watch("file") as FileList | undefined;

  // Atualizar preview do arquivo
  if (selectedFile && selectedFile.length > 0 && !filePreview) {
    setFilePreview(selectedFile[0].name);
  }

  const onSubmit = async (data: UploadMaterialFormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      // Obter o arquivo do FileList, não do data.file
      const fileList = getValues("file") as FileList | undefined;
      const file = fileList && fileList.length > 0 ? fileList[0] : null;

      if (!file || !(file instanceof File)) {
        setError("Arquivo é obrigatório");
        return;
      }

      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description && data.description.trim()) {
        formData.append("description", data.description);
      }
      if (data.course && data.course.trim()) {
        formData.append("course", data.course);
      }
      if (data.discipline && data.discipline.trim()) {
        formData.append("discipline", data.discipline);
      }
      if (data.semester && data.semester.trim()) {
        formData.append("semester", data.semester);
      }
      if (data.type && data.type.trim()) {
        formData.append("type", data.type);
      }
      formData.append("file", file);

      console.log("📤 Iniciando upload...", {
        title: data.title,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      try {
        const result = await uploadMaterial(formData);

        console.log("📥 Resposta do servidor:", result);

        if (result.success) {
          console.log("✅ Upload realizado com sucesso!");
          setSuccess("Upload realizado com sucesso!");
          reset();
          setFilePreview(null);
          // Resetar o input de arquivo manualmente
          const fileInput = document.getElementById("file") as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          setTimeout(() => {
            router.push(`/meus-materiais`);
            router.refresh();
          }, 1500);
        } else {
          console.error("❌ Erro no upload:", result.error);
          setError(result.error);
        }
      } catch (error) {
        console.error("❌ Erro ao chamar uploadMaterial:", error);
        setError(
          error instanceof Error
            ? `Erro: ${error.message}`
            : "Erro ao fazer upload. Tente novamente."
        );
      }
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Título <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          type="text"
          {...register("title")}
          placeholder="Ex: Apostila de Cálculo I"
          aria-required="true"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p
            id="title-error"
            className="mt-1 text-sm text-destructive"
            role="alert"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Descrição
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Descreva o conteúdo do material..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Arquivo */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-2">
          Arquivo PDF <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept="application/pdf"
            {...register("file", {
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFilePreview(file.name);
                } else {
                  setFilePreview(null);
                }
              },
            })}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            aria-required="true"
            aria-invalid={errors.file ? "true" : "false"}
            aria-describedby={errors.file ? "file-error" : undefined}
          />
        </div>
        {filePreview && (
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{filePreview}</span>
          </p>
        )}
        {errors.file?.message && (
          <p
            id="file-error"
            className="mt-1 text-sm text-destructive"
            role="alert"
          >
            {String(errors.file.message)}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Tamanho máximo: 25 MB | Apenas arquivos PDF
        </p>
      </div>

      {/* Campos opcionais em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Curso */}
        <div>
          <label htmlFor="course" className="block text-sm font-medium mb-2">
            Curso
          </label>
          <Input
            id="course"
            type="text"
            {...register("course")}
            placeholder="Ex: Engenharia de Produção"
          />
          {errors.course && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.course.message}
            </p>
          )}
        </div>

        {/* Disciplina */}
        <div>
          <label
            htmlFor="discipline"
            className="block text-sm font-medium mb-2"
          >
            Disciplina
          </label>
          <Input
            id="discipline"
            type="text"
            {...register("discipline")}
            placeholder="Ex: Cálculo I"
          />
          {errors.discipline && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.discipline.message}
            </p>
          )}
        </div>

        {/* Semestre */}
        <div>
          <label htmlFor="semester" className="block text-sm font-medium mb-2">
            Semestre
          </label>
          <Input
            id="semester"
            type="text"
            {...register("semester")}
            placeholder="Ex: 2025.2"
          />
          {errors.semester && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.semester.message}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2">
            Tipo
          </label>
          <Input
            id="type"
            type="text"
            {...register("type")}
            placeholder="Ex: Apostila, Prova, Resumo"
          />
          {errors.type && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.type.message}
            </p>
          )}
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div
          className="rounded-md bg-destructive/10 p-4 border border-destructive/20"
          role="alert"
        >
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div
          className="rounded-md bg-green-50 p-4 border border-green-200"
          role="alert"
        >
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Botão de submit */}
      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-pulse" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Fazer Upload
          </>
        )}
      </Button>
    </motion.form>
  );
}
