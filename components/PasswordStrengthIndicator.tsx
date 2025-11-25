"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "Mínimo de 8 caracteres",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Pelo menos uma letra maiúscula",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Pelo menos uma letra minúscula",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Pelo menos um número",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Pelo menos um símbolo",
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-2 mt-2", className)}>
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Requisitos da senha:
      </p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => {
          const isValid = requirement.test(password);
          return (
            <li key={index} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  "transition-colors",
                  isValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground"
                )}
              >
                {requirement.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
