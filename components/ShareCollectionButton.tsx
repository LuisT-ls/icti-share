"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareCollectionButtonProps {
  collectionId: string;
  title: string;
  description?: string | null;
}

export function ShareCollectionButton({
  collectionId,
  title,
  description,
}: ShareCollectionButtonProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/colecoes/${collectionId}`;
    const shareData = {
      title: title,
      text:
        description ||
        `Confira esta coleção de materiais no ICTI Share: ${title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link da coleção copiado para a área de transferência!");
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Não foi possível compartilhar a coleção.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Compartilhar
    </Button>
  );
}
