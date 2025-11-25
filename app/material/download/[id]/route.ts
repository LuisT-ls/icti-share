import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { headers } from "next/headers";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar material no banco
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o arquivo existe
    if (!existsSync(material.path)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado no servidor" },
        { status: 404 }
      );
    }

    // Ler arquivo
    const fileBuffer = await readFile(material.path);

    // Obter IP do usuário (se disponível)
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      request.ip ||
      null;

    // Obter userId da sessão (se autenticado)
    const session = await auth();
    const userId = session?.user?.id || null;

    // Incrementar contador de downloads e criar registro de download
    await prisma.$transaction(async (tx) => {
      // Incrementar contador
      await tx.material.update({
        where: { id: material.id },
        data: {
          downloadsCount: {
            increment: 1,
          },
        },
      });

      // Criar registro de download
      await tx.download.create({
        data: {
          materialId: material.id,
          userId: userId || null,
          ip: ip || null,
        },
      });
    });

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": material.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(material.filename)}"`,
        "Content-Length": material.size.toString(),
      },
    });
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    return NextResponse.json(
      { error: "Erro ao fazer download do arquivo" },
      { status: 500 }
    );
  }
}

