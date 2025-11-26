import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/UploadForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function UploadPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/upload");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold">
                  Upload de Materiais
                </CardTitle>
                <CardDescription className="text-base md:text-lg mt-2">
                  Faça upload de materiais PDF para compartilhar com a
                  comunidade.
                </CardDescription>
              </div>
            </div>
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
