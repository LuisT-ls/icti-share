#!/bin/bash
# Script para backup do banco de dados PostgreSQL no Railway
# Uso: railway run bash scripts/backup-db.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_db_${DATE}.sql"
BACKUP_DIR="/tmp/backups"

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

echo "🔄 Iniciando backup do banco de dados..."
echo "📅 Data: $(date)"

# Fazer backup
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"; then
    echo "✅ Backup criado com sucesso: $BACKUP_DIR/$BACKUP_FILE"
    echo "📊 Tamanho: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
    
    # Comprimir backup
    echo "🗜️  Comprimindo backup..."
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    echo "✅ Backup comprimido: $BACKUP_DIR/$BACKUP_FILE"
    echo "📊 Tamanho final: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
    
    # Listar backups antigos (manter apenas últimos 7 dias)
    echo "🧹 Limpando backups antigos (>7 dias)..."
    find "$BACKUP_DIR" -name "backup_db_*.sql.gz" -mtime +7 -delete
    
    echo "✅ Backup concluído!"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

