#!/usr/bin/env bash
# stop.sh — Detiene los servicios de GopassTasks
# Uso: ./scripts/stop.sh [--volumes]
#   --volumes  Elimina volúmenes (DB y Redis) — ¡DESTRUCTIVO!

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }

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
  local remove_volumes=false
  for arg in "$@"; do
    case $arg in --volumes) remove_volumes=true ;; esac
  done

  cd "$PROJECT_ROOT"

  if [[ "$remove_volumes" == true ]]; then
    log_warning "⚠️  Se eliminarán los volúmenes (datos de PostgreSQL y Redis se perderán)."
    read -r -p "¿Confirmas? [s/N] " confirm
    [[ "$confirm" != "s" && "$confirm" != "S" ]] && { log_info "Cancelado."; exit 0; }
    log_info "Deteniendo y eliminando volúmenes..."
    dc down --volumes --remove-orphans
    log_success "Servicios detenidos y volúmenes eliminados."
  else
    log_info "Deteniendo servicios (datos preservados)..."
    dc down --remove-orphans
    log_success "✅ Servicios detenidos. Los datos se conservan."
    log_info "  Para eliminar datos también: ./scripts/stop.sh --volumes"
  fi
}

main "$@"
