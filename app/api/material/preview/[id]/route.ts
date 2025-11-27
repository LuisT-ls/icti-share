import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { getSecurityHeaders } from "@/lib/security/headers";

/**
 * Rota para servir PDF para preview (sem forçar download)
 * Usada pelo pdf.js para renderizar o PDF no navegador
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar material no banco
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material não encontrado" },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Verificar se é PDF
    if (material.mimeType !== "application/pdf") {
      return NextResponse.json(
        { error: "Material não é um PDF" },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Detectar ambiente
    const isVercel = !!process.env.VERCEL;
    let fileBuffer: Buffer;

    // Verificar se o arquivo está armazenado em base64 (Vercel) ou no sistema de arquivos
    let fileBuffer: Buffer;

    if (material.path.startsWith("base64:")) {
      // Arquivo armazenado em base64 no banco (Vercel)
      try {
        const base64Content = material.path.substring(7); // Remove prefixo "base64:"
        fileBuffer = Buffer.from(base64Content, "base64");
      } catch (error) {
        console.error("❌ Erro ao decodificar arquivo base64:", error);
        return NextResponse.json(
          { error: "Erro ao processar arquivo" },
          { status: 500, headers: getSecurityHeaders() }
        );
      }
    } else {
      // Arquivo armazenado no sistema de arquivos (Railway/local)
      if (!existsSync(material.path)) {
        console.error("❌ Arquivo não encontrado no caminho:", material.path);
        return NextResponse.json(
          { error: "Arquivo não encontrado no servidor" },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
      fileBuffer = await readFile(material.path);
    }

    // Retornar PDF com headers apropriados para visualização
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Accept-Ranges": "bytes",
        ...getSecurityHeaders(),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao servir PDF para preview:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
