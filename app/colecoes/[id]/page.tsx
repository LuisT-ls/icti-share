import { auth } from "@/auth";
import {
  getCollectionDetails,
  removeFromCollection,
  deleteCollection,
} from "@/app/actions/collections";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Trash2,
  Share2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialCard } from "@/components/MaterialCard"; // Assuming we can reuse or adapt this
// Note: We might need a specialized list item or just reuse MaterialCard.
// For now, I'll create a simple list view to ensure we can handle the removal action easily.

export default async function CollectionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const collection = await getCollectionDetails(id);

  if (!collection) {
    notFound();
  }

  const isOwner = session?.user?.id === collection.userId;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="mb-6">
        <Link
          href="/colecoes"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para minhas coleções
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {collection.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Criada em{" "}
              {new Date(collection.createdAt).toLocaleDateString("pt-BR")}
            </span>
            <span>•</span>
            <span>{collection.items.length} itens</span>
            {!collection.isPublic && (
              <>
                <span>•</span>
                <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                  Privada
                </span>
              </>
            )}
          </div>
          {collection.description && (
            <p className="text-muted-foreground mt-2">
              {collection.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Placeholder for Share button logic */}
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Coleção
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {collection.items.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-muted-foreground">Esta coleção está vazia.</p>
            <Button asChild className="mt-4" variant="secondary">
              <Link href="/materiais">Adicionar Materiais</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {collection.items.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Link
                      href={`/material/${item.material.id}`}
                      className="font-semibold hover:underline"
                    >
                      {item.material.title}
                    </Link>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span>{item.material.course}</span>
                      {item.material.discipline && (
                        <span>• {item.material.discipline}</span>
                      )}
                      <span>
                        Adicionado em{" "}
                        {new Date(item.addedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <form
                    action={async () => {
                      "use server";
                      await removeFromCollection(
                        collection.id,
                        item.material.id
                      );
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover</span>
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
