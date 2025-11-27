"use client";

import { Button } from "./ui/button";
import {
  Share2,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
} from "lucide-react";
import { generateShareUrl, getMaterialUrl } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

interface SocialShareButtonsProps {
  materialId: string;
  title: string;
  description?: string | null;
  className?: string;
}

export function SocialShareButtons({
  materialId,
  title,
  description,
  className,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const materialUrl = getMaterialUrl(materialId);
  const shareText = description ? `${title} - ${description}` : title;
  const fullShareText = `${shareText}\n\n${materialUrl}`;

  const handleShare = async (
    platform: "whatsapp" | "twitter" | "facebook" | "linkedin" | "copy"
  ) => {
    const shareUrl = generateShareUrl(materialId, platform);

    switch (platform) {
      case "whatsapp": {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        break;
      }
      case "twitter": {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
        break;
      }
      case "facebook": {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, "_blank", "noopener,noreferrer");
        break;
      }
      case "linkedin": {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, "_blank", "noopener,noreferrer");
        break;
      }
      case "copy": {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Erro ao copiar link:", err);
        }
        break;
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Compartilhar:
        </span>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleShare("whatsapp")}
            className="gap-2 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40"
            aria-label="Compartilhar no WhatsApp"
          >
            <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleShare("twitter")}
            className="gap-2 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40"
            aria-label="Compartilhar no Twitter"
          >
            <Twitter className="h-4 w-4 text-blue-500" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleShare("facebook")}
            className="gap-2 border-blue-600/20 hover:bg-blue-600/10 hover:border-blue-600/40"
            aria-label="Compartilhar no Facebook"
          >
            <Facebook className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleShare("linkedin")}
            className="gap-2 border-blue-700/20 hover:bg-blue-700/10 hover:border-blue-700/40"
            aria-label="Compartilhar no LinkedIn"
          >
            <Linkedin className="h-4 w-4 text-blue-700 dark:text-blue-500" />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleShare("copy")}
            className="gap-2"
            aria-label="Copiar link de compartilhamento"
          >
            {copied ? (
              <>
                <Share2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="hidden sm:inline text-green-600 dark:text-green-400">
                  Copiado!
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copiar Link</span>
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
