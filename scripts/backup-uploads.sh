#!/bin/bash
# Script para backup dos arquivos de upload no Railway
# Uso: railway run bash scripts/backup-uploads.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_uploads_${DATE}.tar.gz"
BACKUP_DIR="/tmp/backups"
UPLOAD_DIR="${RAILWAY_VOLUME_PATH:-/data/uploads}"

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

echo "🔄 Iniciando backup dos arquivos de upload..."
echo "📅 Data: $(date)"
echo "📁 Diretório: $UPLOAD_DIR"

# Verificar se o diretório existe
if [ ! -d "$UPLOAD_DIR" ]; then
    echo "❌ Diretório de uploads não encontrado: $UPLOAD_DIR"
    exit 1
fi

# Contar arquivos
FILE_COUNT=$(find "$UPLOAD_DIR" -type f | wc -l)
echo "📊 Arquivos encontrados: $FILE_COUNT"

# Fazer backup
if tar -czf "$BACKUP_DIR/$BACKUP_FILE" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"; then
    echo "✅ Backup criado com sucesso: $BACKUP_DIR/$BACKUP_FILE"
    echo "📊 Tamanho: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
    
    # Listar backups antigos (manter apenas últimos 7 dias)
    echo "🧹 Limpando backups antigos (>7 dias)..."
    find "$BACKUP_DIR" -name "backup_uploads_*.tar.gz" -mtime +7 -delete
    
    echo "✅ Backup concluído!"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

