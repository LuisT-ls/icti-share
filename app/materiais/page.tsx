import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Filters } from "@/components/Filters";
import { MaterialList } from "@/components/MaterialList";
import { Pagination } from "@/components/Pagination";
import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { MaterialStatus } from "@prisma/client";

interface SearchParams {
  q?: string;
  course?: string;
  discipline?: string;
  semester?: string;
  type?: string;
  page?: string;
  limit?: string;
}

interface PaginatedMaterials {
  materials: Awaited<ReturnType<typeof prisma.material.findMany>>;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

async function getMaterials(searchParams: SearchParams): Promise<PaginatedMaterials> {
  const where: Prisma.MaterialWhereInput = {
    // Apenas materiais aprovados são exibidos publicamente
    status: MaterialStatus.APPROVED,
  };

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

  // Paginação
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.limit || String(DEFAULT_LIMIT), 10))
  );
  const skip = (page - 1) * limit;

  // Executar contagem e busca em paralelo para melhor performance
  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.material.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    materials,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

async function getFilterOptions() {
  const [courses, disciplines, semesters, types] = await Promise.all([
    prisma.material.findMany({
      select: { course: true },
      distinct: ["course"],
      where: { 
        course: { not: null },
        status: MaterialStatus.APPROVED,
      },
    }),
    prisma.material.findMany({
      select: { discipline: true },
      distinct: ["discipline"],
      where: { 
        discipline: { not: null },
        status: MaterialStatus.APPROVED,
      },
    }),
    prisma.material.findMany({
      select: { semester: true },
      distinct: ["semester"],
      where: { 
        semester: { not: null },
        status: MaterialStatus.APPROVED,
      },
    }),
    prisma.material.findMany({
      select: { type: true },
      distinct: ["type"],
      where: { 
        type: { not: null },
        status: MaterialStatus.APPROVED,
      },
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
  const [materialsData, filterOptions] = await Promise.all([
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
        <MaterialList materials={materialsData.materials} />
        {materialsData.pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={materialsData.pagination.currentPage}
              totalPages={materialsData.pagination.totalPages}
              total={materialsData.pagination.total}
              limit={materialsData.pagination.limit}
            />
          </div>
        )}
      </div>
    </>
  );
}

// Revalidação a cada 60 segundos para manter dados atualizados
export const revalidate = 60;

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

