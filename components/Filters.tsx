"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";

interface FiltersProps {
  courses?: string[];
  disciplines?: string[];
  semesters?: string[];
  types?: string[];
}

export function Filters({ courses, disciplines, semesters, types }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [course, setCourse] = useState(searchParams.get("course") || "");
  const [discipline, setDiscipline] = useState(searchParams.get("discipline") || "");
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              className="pl-10"
              aria-label="Campo de busca"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {courses && courses.length > 0 && (
              <div>
                <label htmlFor="course" className="block text-sm font-medium mb-1">
                  Curso
                </label>
                <select
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Filtrar por curso"
                >
                  <option value="">Todos</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {disciplines && disciplines.length > 0 && (
              <div>
                <label htmlFor="discipline" className="block text-sm font-medium mb-1">
                  Disciplina
                </label>
                <select
                  id="discipline"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Filtrar por disciplina"
                >
                  <option value="">Todas</option>
                  {disciplines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {semesters && semesters.length > 0 && (
              <div>
                <label htmlFor="semester" className="block text-sm font-medium mb-1">
                  Semestre
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Filtrar por semestre"
                >
                  <option value="">Todos</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {types && types.length > 0 && (
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Tipo
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleFilter}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Buscando..." : "Aplicar Filtros"}
            </Button>
            {hasFilters && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="icon"
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

