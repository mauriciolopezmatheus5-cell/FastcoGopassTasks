-- Migración: simplificar TaskStatus a solo PENDIENTE y COMPLETADA
-- Estrategia: crear el nuevo tipo directamente y convertir la columna con USING CASE,
-- evitando el problema de PostgreSQL con ADD VALUE en la misma transacción.
--
-- Mapeo de estados anteriores:
--   BACKLOG, EN_PROGRESO, PRUEBAS_QA → PENDIENTE
--   LISTO, APROBADO                  → COMPLETADA

-- Paso 1: crear el tipo nuevo con solo los dos valores
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDIENTE', 'COMPLETADA');

-- Paso 2: quitar el DEFAULT de la columna (usa el tipo viejo y bloquea el ALTER)
ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT;

-- Paso 3: convertir la columna usando CASE WHEN (mapeo inline)
ALTER TABLE "tasks"
  ALTER COLUMN "status" TYPE "TaskStatus_new"
  USING CASE
    WHEN "status"::text IN ('BACKLOG', 'EN_PROGRESO', 'PRUEBAS_QA') THEN 'PENDIENTE'::"TaskStatus_new"
    ELSE 'COMPLETADA'::"TaskStatus_new"
  END;

-- Paso 4: reemplazar el tipo viejo por el nuevo
DROP TYPE "TaskStatus";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";

-- Paso 5: restablecer el DEFAULT con el nuevo tipo
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'PENDIENTE'::"TaskStatus";
