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

    // Detectar ambiente
    const isVercel = !!process.env.VERCEL;

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

      // Se estamos no Vercel e o arquivo não está em base64, é um arquivo antigo
      // que foi salvo antes da correção e não existe mais
      if (isVercel) {
        console.error(
          "❌ Arquivo antigo detectado no Vercel (não está em base64):",
          material.path
        );
        return NextResponse.json(
          {
            error:
              "Este arquivo foi enviado antes da atualização do sistema. Por favor, reenvie o arquivo para poder fazer download.",
            code: "LEGACY_FILE",
          },
          { status: 404 }
        );
      }

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

    // Verificar se é uma requisição de download real (não prefetch do Next.js)
    // O Next.js faz prefetch com header específico, vamos ignorar essas requisições
    const purposeHeader = request.headers.get("purpose") || "";
    const secPurposeHeader = request.headers.get("sec-purpose") || "";
    const isPrefetch =
      purposeHeader === "prefetch" || secPurposeHeader === "prefetch";

    // Ignorar requisições HEAD (alguns navegadores fazem HEAD antes de GET)
    const isHeadRequest = request.method === "HEAD";

    // Verificar se o arquivo foi lido com sucesso
    const fileIsValid = fileBuffer && fileBuffer.length > 0;

    // IMPORTANTE: Incrementar contador APENAS quando:
    // 1. O arquivo foi lido com sucesso
    // 2. NÃO é uma requisição de prefetch
    // 3. NÃO é uma requisição HEAD
    // 4. NÃO houve download recente (últimos 10 segundos) do mesmo material pelo mesmo usuário/IP
    // Isso garante que o contador só aumenta quando o download realmente é iniciado pelo navegador

    if (!isPrefetch && !isHeadRequest && fileIsValid) {
      // Verificar se já houve um download recente (últimos 10 segundos) do mesmo material
      // pelo mesmo usuário ou IP para evitar contagem duplicada
      const tenSecondsAgo = new Date(Date.now() - 10000); // 10 segundos atrás

      // Construir condições para verificar download recente
      // Só verificamos se temos userId ou IP para evitar bloquear downloads legítimos
      let recentDownload = null;

      if (userId || ip) {
        const whereConditions: any = {
          materialId: material.id,
          createdAt: {
            gte: tenSecondsAgo,
          },
        };

        // Se houver userId, verificar por userId (mais preciso)
        if (userId) {
          whereConditions.userId = userId;
        } else if (ip) {
          // Se não houver userId mas houver IP, verificar por IP
          whereConditions.ip = ip;
          whereConditions.userId = null; // Garantir que é usuário anônimo
        }

        recentDownload = await prisma.download.findFirst({
          where: whereConditions,
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      // Se não houver download recente, incrementar contador
      if (!recentDownload) {
        // Incrementar contador de downloads e criar registro de download
        // Isso acontece APENAS quando confirmamos que é um download real e único
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

        console.log(
          `📥 Download registrado para material ${material.id} - Usuário: ${userId || "anônimo"}, IP: ${ip || "desconhecido"}, Método: ${request.method}`
        );
      } else {
        console.log(
          `⚠️ Download duplicado ignorado para material ${material.id} - Download recente detectado (últimos 10s) - Usuário: ${userId || "anônimo"}, IP: ${ip || "desconhecido"}`
        );
      }
    } else if (isPrefetch) {
      console.log(
        `⚠️ Requisição de prefetch ignorada para material ${material.id}`
      );
    } else if (isHeadRequest) {
      console.log(`⚠️ Requisição HEAD ignorada para material ${material.id}`);
    }

    // Retornar arquivo com headers de segurança
    // Converter Buffer para Uint8Array para compatibilidade com NextResponse
    const response = new NextResponse(new Uint8Array(fileBuffer), {
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
