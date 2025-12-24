"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { createOrUpdateRating } from "@/app/actions/ratings";
import { useRouter } from "next/navigation";

interface RatingStarsProps {
  materialId: string;
  initialRating?: number | null;
  averageRating?: number;
  totalRatings?: number;
  showStats?: boolean;
  interactive?: boolean;
  isOwner?: boolean;
}

export function RatingStars({
  materialId,
  initialRating,
  averageRating = 0,
  totalRatings = 0,
  showStats = true,
  interactive = true,
  isOwner = false,
}: RatingStarsProps) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(
    initialRating || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = async (value: number) => {
    if (!interactive || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("materialId", materialId);
    formData.append("value", String(value));

    const result = await createOrUpdateRating(formData);

    if (result.success) {
      setUserRating(value);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const displayRating = hoveredStar || userRating || Math.round(averageRating);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => interactive && !isOwner && setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={!interactive || isSubmitting || isOwner}
              className={cn(
                "transition-colors duration-200",
                interactive && !isOwner && "cursor-pointer hover:scale-110",
                (!interactive || isOwner) && "cursor-default"
              )}
              aria-label={`Avaliar com ${star} estrela${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600",
                  interactive &&
                  !isSubmitting &&
                  "hover:fill-yellow-300 hover:text-yellow-300"
                )}
              />
            </button>
          ))}
        </div>
        {showStats && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            {totalRatings > 0 && (
              <span className="text-xs">({totalRatings} avaliações)</span>
            )}
          </div>
        )}
      </div>
      {interactive && userRating && !isOwner && (
        <p className="text-xs text-muted-foreground">
          Sua avaliação: {userRating} estrela{userRating > 1 ? "s" : ""}
        </p>
      )}
      {isOwner && (
        <p className="text-xs text-muted-foreground italic">
          Você não pode avaliar seu próprio material.
        </p>
      )}
    </div>
  );
}
