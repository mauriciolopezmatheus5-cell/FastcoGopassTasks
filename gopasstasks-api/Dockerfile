# ── Etapa 1: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
# Generar cliente Prisma antes de compilar (necesario para tipos TypeScript)
RUN npx prisma generate
RUN npm run build
# Eliminar devDependencies del node_modules de producción
RUN npm prune --production

# ── Etapa 2: Runner (imagen final mínima) ────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

# Usuario no-root obligatorio para ECS y buenas prácticas de seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar solo artefactos necesarios del builder
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

EXPOSE 3000

# Health check compatible con ECS health checks y ALB
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
