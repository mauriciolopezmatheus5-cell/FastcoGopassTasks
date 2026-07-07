#!/usr/bin/env bash
# start.sh — Inicia todos los servicios de GopassTasks en local
# Uso: ./scripts/start.sh [--build] [--seed]
#   --build  Reconstruir imágenes Docker antes de iniciar
#   --seed   Ejecutar seed de base de datos tras iniciar

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

check_dependencies() {
  for cmd in docker curl; do
    if ! command -v "$cmd" &>/dev/null; then
      log_error "Comando no encontrado: $cmd. Instálalo antes de continuar."
      exit 1
    fi
  done
  if ! docker compose version &>/dev/null; then
    log_error "Docker Compose v2 no encontrado. Instala Docker Desktop o el plugin docker-compose."
    exit 1
  fi
}

load_env() {
  local env_file="$PROJECT_ROOT/.env.docker"
  if [[ -f "$env_file" ]]; then
    log_info "Cargando variables desde .env.docker"
    set -o allexport
    source "$env_file"
    set +o allexport
    # Exportar la ruta del env-file para que dc() la use en todos los comandos
    DOCKER_ENV_FILE="$env_file"
  else
    log_warning ".env.docker no encontrado. Usando valores por defecto del docker-compose.yml"
    log_warning "  Copia: cp .env.docker.example .env.docker"
    DOCKER_ENV_FILE=""
  fi
}

# Wrapper para docker compose que siempre pasa --env-file cuando está disponible
dc() {
  if [[ -n "${DOCKER_ENV_FILE:-}" ]]; then
    docker compose --env-file "$DOCKER_ENV_FILE" "$@"
  else
    docker compose "$@"
  fi
}

main() {
  local build_flag=""
  local run_seed=false

  for arg in "$@"; do
    case $arg in
      --build) build_flag="--build" ;;
      --seed)  run_seed=true ;;
      *) log_error "Argumento desconocido: $arg"; exit 1 ;;
    esac
  done

  cd "$PROJECT_ROOT"
  log_info "🚀 Iniciando GopassTasks — Entorno Local"
  echo "────────────────────────────────────────"

  check_dependencies
  load_env

  # Iniciar infraestructura base
  log_info "Iniciando PostgreSQL y Redis..."
  dc up -d postgres redis $build_flag

  # Esperar PostgreSQL
  log_info "Esperando que PostgreSQL esté listo..."
  local retries=0
  until dc exec -T postgres pg_isready -U "${POSTGRES_USER:-gopass}" &>/dev/null; do
    retries=$((retries + 1))
    if [[ $retries -ge 30 ]]; then
      log_error "PostgreSQL no respondió en 30 intentos. Logs:"
      dc logs postgres | tail -20
      exit 1
    fi
    sleep 2
  done
  log_success "PostgreSQL listo."

  # Migraciones
  log_info "Aplicando migraciones de Prisma..."
  dc run --rm api npx prisma migrate deploy
  log_success "Migraciones aplicadas."

  # Seed opcional
  if [[ "$run_seed" == true ]]; then
    log_info "Ejecutando seed de base de datos..."
    dc run --rm api npx prisma db seed
    log_success "Seed ejecutado."
  fi

  # Iniciar todos los servicios
  log_info "Iniciando API y Frontend..."
  dc up -d $build_flag

  echo ""
  echo "────────────────────────────────────────"
  log_success "✅ GopassTasks está corriendo:"
  echo ""
  echo "  🌐 Frontend:   http://localhost:5173"
  echo "  🔧 API:        http://localhost:3000/api/v1"
  echo "  📚 Swagger:    http://localhost:3000/api/docs"
  echo "  🗄️  PostgreSQL: localhost:5432"
  echo "  ⚡ Redis:       localhost:6379"
  echo ""
  echo "  Logs:     docker compose logs -f [api|web|postgres|redis]"
  echo "  Detener:  ./scripts/stop.sh"
  echo "────────────────────────────────────────"
}

main "$@"
