import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/UploadForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UploadPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/upload");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Upload de Materiais</CardTitle>
            <CardDescription>
              Faça upload de materiais PDF para compartilhar com a comunidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
