import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MaterialList } from "@/components/MaterialList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MaterialActions } from "@/components/MaterialActions";

export default async function MeusMateriaisPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/meus-materiais");
  }

  const materials = await prisma.material.findMany({
    where: { uploadedById: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Meus Materiais</CardTitle>
            <CardDescription>
              Gerencie os materiais que você enviou para a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Você ainda não enviou nenhum material.
                </p>
                <a
                  href="/upload"
                  className="text-primary hover:underline font-medium"
                >
                  Fazer primeiro upload
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          <a
                            href={`/material/${material.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {material.title}
                          </a>
                        </h3>
                        {material.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {material.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{material.downloadsCount} downloads</span>
                          <span>
                            {new Date(material.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                      </div>
                      <MaterialActions material={material} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
