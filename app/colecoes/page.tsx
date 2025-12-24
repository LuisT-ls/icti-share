import { auth } from "@/auth";
import { getUserCollections } from "@/app/actions/collections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Folder, ArrowRight, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CollectionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/colecoes");
  }

  const collections = await getUserCollections();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Coleções</h1>
          <p className="text-muted-foreground mt-2">
            Organize seus materiais de estudo em listas personalizadas.
          </p>
        </div>
        {/* Placeholder para botão de criar coleção isoladamente, se necessário */}
      </div>

      {collections.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Folder className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">
              Nenhuma coleção encontrada
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Você ainda não criou nenhuma coleção. Comece salvando materiais em
              uma nova lista.
            </p>
            <Button asChild>
              <Link href="/materiais">Explorar Materiais</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection: any) => (
            <Link
              key={collection.id}
              href={`/colecoes/${collection.id}`}
              className="group"
            >
              <Card className="h-full transition-colors hover:bg-muted/50 group-hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <span className="truncate">{collection.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {collection._count.items} materiais
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(collection.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
