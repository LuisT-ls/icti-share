import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

interface AuditLogData {
  action: AuditAction;
  userId?: string;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Criar um log de auditoria
 * Esta função não deve lançar erros para não interromper o fluxo principal
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId || null,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        description: data.description,
        metadata: data.metadata || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (error) {
    // Log silencioso - não queremos que erros de auditoria interrompam o fluxo principal
    console.error("[AuditLog] Erro ao criar log de auditoria:", error);
  }
}

/**
 * Buscar logs de auditoria com filtros
 */
export async function getAuditLogs(params: {
  action?: AuditAction;
  userId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (params.action) {
    where.action = params.action;
  }

  if (params.userId) {
    where.userId = params.userId;
  }

  if (params.entityType) {
    where.entityType = params.entityType;
  }

  if (params.entityId) {
    where.entityId = params.entityId;
  }

  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) {
      where.createdAt.gte = params.startDate;
    }
    if (params.endDate) {
      where.createdAt.lte = params.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: params.limit || 100,
      skip: params.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
  };
}

/**
 * Exportar logs de auditoria para CSV
 */
export async function exportAuditLogsToCSV(params: {
  action?: AuditAction;
  userId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<string> {
  const { logs } = await getAuditLogs({
    ...params,
    limit: 10000, // Limite para exportação
  });

  // Cabeçalho CSV
  const headers = [
    "ID",
    "Data/Hora",
    "Ação",
    "Usuário",
    "Email",
    "Tipo de Entidade",
    "ID da Entidade",
    "Descrição",
    "IP",
    "User Agent",
    "Metadados",
  ];

  // Linhas CSV
  const rows = logs.map((log) => [
    log.id,
    log.createdAt.toISOString(),
    log.action,
    log.user?.name || "N/A",
    log.user?.email || "N/A",
    log.entityType || "N/A",
    log.entityId || "N/A",
    log.description.replace(/"/g, '""'), // Escapar aspas
    log.ipAddress || "N/A",
    log.userAgent || "N/A",
    log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : "N/A",
  ]);

  // Combinar cabeçalho e linhas
  const csvLines = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ];

  return csvLines.join("\n");
}
