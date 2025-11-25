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

    // Verificar se o arquivo está armazenado em base64 (Vercel) ou no sistema de arquivos
    let fileBuffer: Buffer;

    if (material.path.startsWith("base64:")) {
      // Arquivo armazenado em base64 no banco (Vercel)
      console.log("📦 Arquivo armazenado em base64, decodificando...");
      try {
        const base64Content = material.path.substring(7); // Remove prefixo "base64:"
        fileBuffer = Buffer.from(base64Content, "base64");
        console.log(
          "✅ Arquivo decodificado com sucesso, tamanho:",
          fileBuffer.length
        );
      } catch (error) {
        console.error("❌ Erro ao decodificar arquivo base64:", error);
        return NextResponse.json(
          { error: "Erro ao processar arquivo" },
          { status: 500 }
        );
      }
    } else {
      // Arquivo armazenado no sistema de arquivos (Railway/local)
      console.log(
        "📁 Verificando arquivo no sistema de arquivos:",
        material.path
      );
      if (!existsSync(material.path)) {
        console.error("❌ Arquivo não encontrado no caminho:", material.path);
        return NextResponse.json(
          { error: "Arquivo não encontrado no servidor" },
          { status: 404 }
        );
      }
      console.log("📖 Lendo arquivo do disco...");
      fileBuffer = await readFile(material.path);
      console.log("✅ Arquivo lido com sucesso, tamanho:", fileBuffer.length);
    }

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
