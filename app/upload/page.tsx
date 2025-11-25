import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/UploadForm";

export default async function UploadPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/upload");
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload de Materiais
          </h1>
          <p className="mt-2 text-gray-600">
            Faça upload de materiais PDF para compartilhar com a comunidade.
          </p>
        </div>

        <UploadForm />
      </div>
    </div>
  );
}

