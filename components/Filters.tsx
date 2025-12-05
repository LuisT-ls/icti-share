"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, X, ChevronDown } from "lucide-react";

interface FiltersProps {
  courses?: string[];
  disciplines?: string[];
  semesters?: string[];
  types?: string[];
}

export function Filters({
  courses,
  disciplines,
  semesters,
  types,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [course, setCourse] = useState(searchParams.get("course") || "");
  const [discipline, setDiscipline] = useState(
    searchParams.get("discipline") || ""
  );
  const [semester, setSemester] = useState(searchParams.get("semester") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  const handleFilter = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (course) params.set("course", course);
      if (discipline) params.set("discipline", discipline);
      if (semester) params.set("semester", semester);
      if (type) params.set("type", type);
      // Resetar para página 1 ao aplicar novos filtros
      // (não incluir page, deixar o padrão assumir)

      router.push(`/materiais?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    setCourse("");
    setDiscipline("");
    setSemester("");
    setType("");
    router.push("/materiais");
  };

  const hasFilters = search || course || discipline || semester || type;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-light-divider dark:border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Search className="h-5 w-5 text-accent-light" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilter();
                }
              }}
              className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              aria-label="Campo de busca"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {courses && courses.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="course"
                  className="block text-sm font-semibold text-foreground"
                >
                  Curso
                </label>
                <div className="relative">
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 appearance-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
                    style={{
                      colorScheme: "dark",
                    }}
                    aria-label="Filtrar por curso"
                  >
                    <option value="">Todos</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            {disciplines && disciplines.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="discipline"
                  className="block text-sm font-semibold text-foreground"
                >
                  Disciplina
                </label>
                <div className="relative">
                  <select
                    id="discipline"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 appearance-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
                    style={{
                      colorScheme: "dark",
                    }}
                    aria-label="Filtrar por disciplina"
                  >
                    <option value="">Todas</option>
                    {disciplines.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            {semesters && semesters.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="semester"
                  className="block text-sm font-semibold text-foreground"
                >
                  Semestre
                </label>
                <div className="relative">
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 appearance-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
                    style={{
                      colorScheme: "dark",
                    }}
                    aria-label="Filtrar por semestre"
                  >
                    <option value="">Todos</option>
                    {semesters.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            {types && types.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="block text-sm font-semibold text-foreground"
                >
                  Tipo
                </label>
                <div className="relative">
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 appearance-none cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
                    style={{
                      colorScheme: "dark",
                    }}
                    aria-label="Filtrar por tipo"
                  >
                    <option value="">Todos</option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleFilter}
              disabled={isPending}
              className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Buscando...
                </span>
              ) : (
                "Aplicar Filtros"
              )}
            </Button>
            {hasFilters && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="icon"
                className="h-11 w-11 border-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200"
                aria-label="Limpar filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
