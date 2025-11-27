import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { getAuditLogs, exportAuditLogsToCSV } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") as AuditAction | null;
    const userId = searchParams.get("userId") || undefined;
    const entityType = searchParams.get("entityType") || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 100;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;
    const exportFormat = searchParams.get("export");

    if (exportFormat === "csv") {
      const csv = await exportAuditLogsToCSV({
        action: action || undefined,
        userId,
        entityType,
        entityId,
        startDate,
        endDate,
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const { logs, total } = await getAuditLogs({
      action: action || undefined,
      userId,
      entityType,
      entityId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logs de auditoria" },
      { status: 500 }
    );
  }
}
