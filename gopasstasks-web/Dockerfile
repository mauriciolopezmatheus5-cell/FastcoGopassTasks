# ── Etapa 1: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL se inyecta en tiempo de build desde ARG (ECS task definition)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
# Resultado: carpeta /app/dist con los artefactos estáticos

# ── Etapa 2: Nginx (imagen final mínima) ─────────────────────────
FROM nginx:1.27-alpine AS runner

# Configuración de Nginx para SPA React Router (redirect all → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build del builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check para ALB y ECS
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
