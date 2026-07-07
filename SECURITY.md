# Política de Seguridad — GopassTasks

## Versiones Soportadas

| Versión | Soportada |
|---------|-----------|
| `main` (producción) | ✅ |
| `develop` | ✅ |
| Versiones anteriores | ❌ |

## Reportar una Vulnerabilidad

**No abras un issue público para reportar vulnerabilidades de seguridad.**

Si descubres una vulnerabilidad, por favor:

1. **Envía un reporte privado** a través de [GitHub Security Advisories](https://github.com/mauriciolopezmatheus5-cell/mlGopassTasks/security/advisories/new)
2. Incluye en tu reporte:
   - Descripción de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Sugerencia de corrección (opcional)

### Tiempo de Respuesta

- **Confirmación de recepción:** dentro de 48 horas
- **Evaluación inicial:** dentro de 5 días hábiles
- **Resolución:** depende de la severidad

### Divulgación Responsable

Nos comprometemos a:
- Notificarte cuando la vulnerabilidad sea corregida
- Darte crédito en el changelog (si lo deseas)
- No tomar acciones legales contra investigadores de buena fe

## Prácticas de Seguridad del Proyecto

- ✅ JWT almacenado en cookies `HttpOnly` (protección XSS)
- ✅ Flags `Secure` y `SameSite=Strict` en cookies
- ✅ CORS restrictivo (solo origen del frontend)
- ✅ Helmet.js para headers HTTP seguros
- ✅ Contraseñas hasheadas con bcrypt (factor 12)
- ✅ Validación de input con `class-validator` + whitelist
- ✅ Usuarios no-root en contenedores Docker
- ✅ Secrets en AWS Secrets Manager (producción)
- ✅ Variables de entorno validadas al arrancar (Fail Fast)
