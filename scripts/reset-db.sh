#!/usr/bin/env bash
# reset-db.sh — Reinicia completamente la base de datos local
# ADVERTENCIA: Elimina TODOS los datos y vuelve a aplicar migraciones + seed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Wrapper que pasa --env-file cuando .env.docker existe
dc() {
  local env_file="$PROJECT_ROOT/.env.docker"
  if [[ -f "$env_file" ]]; then
    docker compose --env-file "$env_file" "$@"
  else
    docker compose "$@"
  fi
}

main() {
  cd "$PROJECT_ROOT"

  log_warning "⚠️  ADVERTENCIA: Se ELIMINARÁN todos los datos de la base de datos local."
  read -r -p "¿Confirmas? [s/N] " confirm
  [[ "$confirm" != "s" && "$confirm" != "S" ]] && { log_info "Cancelado."; exit 0; }

  # Verificar que postgres está corriendo
  if ! dc ps postgres 2>/dev/null | grep -qE "healthy|running|Up"; then
    log_error "PostgreSQL no está corriendo. Ejecuta primero: ./scripts/start.sh"
    exit 1
  fi

  log_info "Reiniciando base de datos..."
  dc run --rm api npx prisma migrate reset --force
  log_success "Migraciones reaplicadas."

  log_info "Ejecutando seed..."
  dc run --rm api npx prisma db seed
  log_success "Seed ejecutado."

  log_success "✅ Base de datos reiniciada correctamente."
}

main "$@"
