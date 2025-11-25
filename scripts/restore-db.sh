#!/bin/bash
# Script para restaurar backup do banco de dados PostgreSQL no Railway
# Uso: railway run bash scripts/restore-db.sh <arquivo-backup.sql>
# Exemplo: railway run bash scripts/restore-db.sh backup_db_20241124_120000.sql

set -e

if [ -z "$1" ]; then
    echo "❌ Erro: Arquivo de backup não especificado"
    echo "📝 Uso: railway run bash scripts/restore-db.sh <arquivo-backup.sql>"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="/tmp/backups"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Determinar caminho completo
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    FULL_PATH="$BACKUP_DIR/$BACKUP_FILE"
else
    FULL_PATH="$BACKUP_FILE"
fi

echo "🔄 Iniciando restauração do banco de dados..."
echo "📅 Data: $(date)"
echo "📁 Arquivo: $FULL_PATH"

# Verificar se é arquivo comprimido
if [[ "$FULL_PATH" == *.gz ]]; then
    echo "🗜️  Descomprimindo backup..."
    gunzip -c "$FULL_PATH" | psql "$DATABASE_URL"
else
    psql "$DATABASE_URL" < "$FULL_PATH"
fi

if [ $? -eq 0 ]; then
    echo "✅ Restauração concluída com sucesso!"
else
    echo "❌ Erro ao restaurar backup"
    exit 1
fi

