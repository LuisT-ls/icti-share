"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FileDown, Search, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuditAction } from "@prisma/client";

interface AuditLog {
  id: string;
  action: AuditAction;
  description: string;
  entityType: string | null;
  entityId: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface AuditLogsViewerProps {
  initialLogs?: AuditLog[];
  initialTotal?: number;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  MATERIAL_UPLOAD: "Upload de Material",
  MATERIAL_DELETE: "Exclusão de Material",
  MATERIAL_APPROVE: "Aprovação de Material",
  MATERIAL_REJECT: "Rejeição de Material",
  MATERIAL_UPDATE: "Atualização de Material",
  USER_CREATE: "Criação de Usuário",
  USER_UPDATE: "Atualização de Usuário",
  USER_DELETE: "Exclusão de Usuário",
  USER_ROLE_CHANGE: "Alteração de Role",
  COMMENT_CREATE: "Criação de Comentário",
  COMMENT_DELETE: "Exclusão de Comentário",
  COMMENT_MODERATE: "Moderação de Comentário",
  RATING_CREATE: "Criação de Avaliação",
  RATING_UPDATE: "Atualização de Avaliação",
  LOGIN: "Login",
  LOGOUT: "Logout",
  PASSWORD_RESET: "Reset de Senha",
  ADMIN_ACTION: "Ação Administrativa",
};

export function AuditLogsViewer({
  initialLogs = [],
  initialTotal = 0,
}: AuditLogsViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [entityIdFilter, setEntityIdFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String((page - 1) * limit),
      });

      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }
      if (entityTypeFilter) {
        params.append("entityType", entityTypeFilter);
      }
      if (entityIdFilter) {
        params.append("entityId", entityIdFilter);
      }

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityTypeFilter, entityIdFilter]);

  const handleExport = () => {
    const params = new URLSearchParams({ export: "csv" });
    if (actionFilter !== "all") {
      params.append("action", actionFilter);
    }
    if (entityTypeFilter) {
      params.append("entityType", entityTypeFilter);
    }
    if (entityIdFilter) {
      params.append("entityId", entityIdFilter);
    }

    window.open(`/api/admin/audit-logs?${params}`, "_blank");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Logs de Auditoria</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Registro de todas as ações críticas do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Tipo de entidade (ex: Material)"
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="w-[200px]"
          />

          <Input
            placeholder="ID da entidade"
            value={entityIdFilter}
            onChange={(e) => setEntityIdFilter(e.target.value)}
            className="w-[200px]"
          />
        </div>

        {/* Tabela de logs */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div>
                          <div className="font-medium text-sm">
                            {log.user.name || log.user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Sistema
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm truncate">{log.description}</div>
                    </TableCell>
                    <TableCell>
                      {log.entityType && log.entityId ? (
                        <div className="text-xs">
                          <div className="font-medium">{log.entityType}</div>
                          <div className="text-muted-foreground font-mono">
                            {log.entityId.substring(0, 8)}...
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {log.ipAddress || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, total)} de {total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
