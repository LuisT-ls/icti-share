import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Filters } from "@/components/Filters";
import { MaterialList } from "@/components/MaterialList";
import { Suspense } from "react";

interface SearchParams {
  q?: string;
  course?: string;
  discipline?: string;
  semester?: string;
  type?: string;
}

async function getMaterials(searchParams: SearchParams) {
  const where: any = {};

  // Busca por texto
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  // Filtros
  if (searchParams.course) {
    where.course = searchParams.course;
  }
  if (searchParams.discipline) {
    where.discipline = searchParams.discipline;
  }
  if (searchParams.semester) {
    where.semester = searchParams.semester;
  }
  if (searchParams.type) {
    where.type = searchParams.type;
  }

  const materials = await prisma.material.findMany({
    where,
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

  return materials;
}

async function getFilterOptions() {
  const [courses, disciplines, semesters, types] = await Promise.all([
    prisma.material.findMany({
      select: { course: true },
      distinct: ["course"],
      where: { course: { not: null } },
    }),
    prisma.material.findMany({
      select: { discipline: true },
      distinct: ["discipline"],
      where: { discipline: { not: null } },
    }),
    prisma.material.findMany({
      select: { semester: true },
      distinct: ["semester"],
      where: { semester: { not: null } },
    }),
    prisma.material.findMany({
      select: { type: true },
      distinct: ["type"],
      where: { type: { not: null } },
    }),
  ]);

  return {
    courses: courses.map((c) => c.course).filter(Boolean) as string[],
    disciplines: disciplines.map((d) => d.discipline).filter(Boolean) as string[],
    semesters: semesters.map((s) => s.semester).filter(Boolean) as string[],
    types: types.map((t) => t.type).filter(Boolean) as string[],
  };
}

async function MaterialsContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [materials, filterOptions] = await Promise.all([
    getMaterials(params),
    getFilterOptions(),
  ]);

  return (
    <>
      <Filters
        courses={filterOptions.courses}
        disciplines={filterOptions.disciplines}
        semesters={filterOptions.semesters}
        types={filterOptions.types}
      />
      <div className="mt-6">
        <MaterialList materials={materials} />
      </div>
    </>
  );
}

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Materiais</h1>
          <p className="text-muted-foreground">
            Explore todos os materiais disponíveis na plataforma
          </p>
        </div>
        <Suspense
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando materiais...</p>
            </div>
          }
        >
          <MaterialsContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

