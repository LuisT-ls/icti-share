"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import { uploadMaterial } from "@/app/actions/upload";
import { useRouter } from "next/navigation";

const uploadFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional().or(z.literal("")),
  course: z.string().max(100).optional().or(z.literal("")),
  discipline: z.string().max(100).optional().or(z.literal("")),
  semester: z.string().max(50).optional().or(z.literal("")),
  type: z.string().max(50).optional().or(z.literal("")),
  file: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, {
      message: "Arquivo é obrigatório",
    })
    .refine((file) => file instanceof File && file.size <= 25 * 1024 * 1024, {
      message: "Arquivo muito grande. Tamanho máximo: 25 MB",
    })
    .refine((file) => file instanceof File && file.type === "application/pdf", {
      message: "Apenas arquivos PDF são permitidos",
    }),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

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
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
  });

  const selectedFile = watch("file") as FileList | undefined;

  // Atualizar preview do arquivo
  if (selectedFile && selectedFile.length > 0 && !filePreview) {
    setFilePreview(selectedFile[0].name);
  }

  const onSubmit = async (data: UploadFormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const file = data.file as File;
      if (!file) {
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

      const result = await uploadMaterial(formData);

      if (result.success) {
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
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Título */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Ex: Apostila de Cálculo I"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descrição
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Descreva o conteúdo do material..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Arquivo */}
      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Arquivo PDF <span className="text-red-500">*</span>
        </label>
        <input
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {filePreview && (
          <p className="mt-2 text-sm text-gray-600">
            Arquivo selecionado: <span className="font-medium">{filePreview}</span>
          </p>
        )}
        {errors.file && (
          <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Tamanho máximo: 25 MB | Apenas arquivos PDF
        </p>
      </div>

      {/* Campos opcionais em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Curso */}
        <div>
          <label
            htmlFor="course"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Curso
          </label>
          <input
            id="course"
            type="text"
            {...register("course")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Ex: Engenharia de Software"
          />
          {errors.course && (
            <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
          )}
        </div>

        {/* Disciplina */}
        <div>
          <label
            htmlFor="discipline"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Disciplina
          </label>
          <input
            id="discipline"
            type="text"
            {...register("discipline")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Ex: Cálculo I"
          />
          {errors.discipline && (
            <p className="mt-1 text-sm text-red-600">{errors.discipline.message}</p>
          )}
        </div>

        {/* Semestre */}
        <div>
          <label
            htmlFor="semester"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Semestre
          </label>
          <input
            id="semester"
            type="text"
            {...register("semester")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Ex: 2024.1"
          />
          {errors.semester && (
            <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tipo
          </label>
          <input
            id="type"
            type="text"
            {...register("type")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Ex: Apostila, Prova, Resumo"
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Botão de submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isPending ? "Enviando..." : "Fazer Upload"}
      </button>
    </form>
  );
}

