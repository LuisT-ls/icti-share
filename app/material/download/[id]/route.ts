import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { headers } from "next/headers";
import { auth } from "@/auth";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";
import { getSecurityHeaders } from "@/lib/security/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate limiting
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      null;
    const session = await auth();
    const userId = session?.user?.id || null;

    const identifier = getRateLimitIdentifier(ip, userId);
    const rateLimitResult = checkRateLimit(
      identifier,
      RATE_LIMIT_CONFIGS.DOWNLOAD
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error:
            rateLimitResult.error ||
            "Muitas requisições. Tente novamente mais tarde.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
            ...getSecurityHeaders(),
          },
        }
      );
    }

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

    // IP e userId já obtidos acima para rate limiting

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

    // Retornar arquivo com headers de segurança
    const response = new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": material.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(material.filename)}"`,
        "Content-Length": material.size.toString(),
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        ...getSecurityHeaders(),
      },
    });

    return response;
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    return NextResponse.json(
      { error: "Erro ao fazer download do arquivo" },
      {
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}
